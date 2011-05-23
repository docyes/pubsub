function Subject(type){
    var self = this,
        observers = [];
    var sortObservers = function(a, b){
        if(a.priority<b.priority){
            return -1;
        }
        if(a.priority>b.priority){
            return 1;
        }else{
            if(a.timestamp<b.timestamp){
                return -1;
            }else if(a.timestamp>b.timestamp){
                return 1;
            }else{
                return 0;
            }
        }
    };
    self.addEventListener = function(callback, priority){
        var observer = new Observer(callback, priority);
        self.removeEventListener(observer)
        observers.push(observer);
        observers.sort(sortObservers);
    };
    self.removeEventListener = function(observer){
        for(var i=0; i<observers.length; i++){
            if(observers[i].callback==observer.callback){
                observers.splice(i, 1);
                break;
            }
        }
    };
    self.dispatchEvent = function(errorHalt){
        var args = arguments[1] || [];
        return new Dispatcher(type, observers, errorHalt, args);
    };
};
function Observer(callback, priority){
    var self = this;
        self.priority = priority;
        self.timestamp = (new Date()).getTime();
        self.callback = callback;
        self.preventDefault = false;
};
function Dispatcher(type, observers, errorHalt, args){
    var preventDefaultState = false,
        self = this;
        self.type = type,
        self.observers = observers.concat([]),
        self.errorHalt = errorHalt,
        self.args = args;
    var callbackErrorMessage = function(observer){
        return ["Event", type, "could not call", observer, "."].join(" ");
    }
    var notify = function(observer){
        if(!observer.preventDefault){
            if(self.errorHalt){
                try {
                    observer.callback(self);
                }catch(e){
                    var callError = new Error(callbackErrorMessage(observer.callback));
                    setTimeout(callError, 0);
                    observer.error = e;
                    throw e;
                }
            }else{
                try{
                    observer.callback(self);
                }catch(e){
                    var callError = new Error(callbackErrorMessage(observer.callback));
                    setTimeout(callError, 0)
                    observer.error = e;
                    setTimeout(e, 0);
                }
            }
        }
    };
    self.preventDefault = function(){
        preventDefaultState = true; 
    };
    self.Dispatcher = function(){
        for(var i=0; i<self.observers.length; i++){
            var observer = observers[i];
            observer.preventDefault = preventDefaultState;
            notify(observer);
        }
        preventDefaultState = false;
    }();
}

/**
 * Examples.
 */
function foo1(event){
    console.log("foo1 called.")
    event.preventDefault();
}
function foo2(){
    var str = "";
    fdsafdsa
    for(var i=0; i<100000; i++){
        str += "f" + new Date();
    }
    console.log("foo2 called");
}
function foo3(){
    console.log("foo3 called")  
}

var myEvent1 = new Subject("PreventDefaultExample");
myEvent1.addEventListener(foo1, 1);
myEvent1.addEventListener(foo2, 1);//will never be called because foo1 preventDefault on event
myEvent1.addEventListener(foo3, 1);//will never be called because foo1 preventDefault on event
myEvent1.dispatchEvent(false);


var myEvent2 = new Subject("PreventDefaultExample");
myEvent2.addEventListener(foo1, 3);//will be called first due to highest priority
myEvent2.addEventListener(foo2, 2);//will be called second...
myEvent2.addEventListener(foo3, 1);//will be called last
myEvent2.dispatchEvent(false);



