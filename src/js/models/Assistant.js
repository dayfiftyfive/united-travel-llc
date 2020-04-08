class Assistant {
    
    // Class Constructor
    constructor( props ) {
        this.elements = props.getAll ? props.elements : [ props.elements[ props.index ] ];
        this.selector = props.selector;
        this.root = ( props.elements[0] === window || props.elements[0] === document ) ? true : false;
        this.listeners = props.listeners;
    }

    // Cycle Back
    cycle() {
        return new Assistant({
            elements: this.elements,
            selector: this.selector,
            getAll: true,
            index: 0,
            listeners: this.listeners
        });
    }


    // Return Elements
    e() {
        return this.elements.length ? ( ( this.elements.length > 1 ) ? this.elements : this.elements[0] ) : [];
    }


    // Get Value Of Element
    val() {
        return this.elements[0].value
    }


    // Set Value For Elements
    setVal( value ) {
        this.elements.forEach( element => { element.value = value });
        return this.cycle();
    }


    // Access Dataset Shortcut
    data(name) {
        if (!name) return this.elements[0].dataset;
        return this.elements[0].dataset[name];
    }


    // Set HTML Content Shortcut
    html( content ) {
        if ( Array.isArray( content ) ) this.elements.forEach( ( element, i ) => { element.innerHTML = content[i] });

        else this.elements.forEach( element => { element.innerHTML = content });

        return this.cycle();
    }


    // Set CSS Properties
    css( properties ) {
        this.elements.forEach(element => {
            Object.assign(element.style, properties);
        });
        return this.cycle();
    }

    // Set Attribute Shortcut
    set( attr, value ) {
        this.elements.forEach(element => { element.setAttribute( attr, value ) });
        return this.cycle();
    }


    // Swap Classes
    switchClass( remove, add ) {
        this.elements.forEach( element => {
            element.classList.remove( remove );
            element.classList.add( add );
        });
        return this.cycle();
    }
    
    
    // Swap Classes
    toggle( name ) {
        this.elements.forEach( element => element.classList.toggle( name ) );
        return this.cycle();
    }
    
    // Swap Classes
    addClass( name ) {
        this.elements.forEach( element => element.classList.add( name ) );
        return this.cycle();
    }
    

    // Swap Classes
    removeClass( name ) {
        this.elements.forEach( element => element.classList.remove( name ) );
        return this.cycle();
    }
    

    // Set TextContent Shortcut
    text( content ) {

        if ( Array.isArray( content ) ) this.elements.forEach( ( element, i ) => { element.textContent = content[i] });

        else this.elements.forEach( element => { element.textContent = content });

        return this.cycle();

    }


    // Insert Adjacent Shortcut
    insert( position, content ) {
        this.elements.forEach( element =>  element.insertAdjacentHTML( position, content ) );
        return this.cycle();
    }


    // Remove Elements
    remove() {
        if (this.elements.length) this.elements.forEach( element => element.parentElement.removeChild(element) );
    }
    
    
    // Remove Elements
    delete( level ) {

        if (!this.elements.length) return;

        if ( !level || level < 0 ) this.elements.forEach( element => element.parentElement.removeChild(element) );

        else this.elements.forEach( element => {

            let toRemove = element;

            for ( let i = 0; i < level; i++) {
                toRemove = toRemove.parentElement;
            }

            toRemove.parentElement.removeChild(toRemove);

        });

    }


    // Returns an Array of All other nodes
    siblings() {
        const brother = this.elements[0];

        let node = brother.parentElement.firstChild;
                
        let nodes = [];
        
        while ( node ) {
            
            if ( node !== brother && node.nodeType === Node.ELEMENT_NODE ) 
            nodes.push( node );
            
            node = node.nextElementSibling || node.nextSibling;
            
        }
        
        this.elements = nodes;

        return this.cycle();
    }


    children( selector ) {

        let nodes = [];

        if ( selector ) {

            this.elements.forEach(element => {
                nodes = nodes.concat( 
                    Array.from( element.querySelectorAll( selector ) ) 
                );
            });   

        }

        else {

            this.elements.forEach(element => {
                nodes = nodes.concat( 
                    Array.from( element.children ) 
                );
            });
            this.selector = selector;

        }

        if ( nodes.length ) this.elements = nodes;
        return this.cycle();

    }


    // Attach Event Listeners
    on( eventType, eventAction ) {
        this.elements.forEach( element => { element.addEventListener( eventType, eventAction )});
        return this.cycle();
    }


    // Remove Event Listeners
    off( eventType, eventAction ) {
        this.elements.forEach( element => element.removeEventListener( eventType, eventAction ));
        return this.cycle();
    }


    // Attach Event Listener To Parent
    delegateTo( parentSelector, eventType, eventAction ) {

        // Cannot Delegate Events on Root Elements
        if ( this.root ) return;


        // Select Parents
        this.select(parentSelector).forEach( parent => {

            const delegate = event => {

                const target = event.target;
    
                this.elements.forEach( element => {
    
                    let current = target;
    
                    while ( current && current !== parent ) {

                        if ( current === element ) return eventAction.call( element, event );

                        current = current.parentNode;

                    }
    
                });
    
            }

            parent.addEventListener(eventType, delegate);

        });


        // Return Function To Allow For Chaining
        return this.cycle();

    }

    
    // Attach Event Listener To Parent
    listenFor( eventType, selector, eventAction ) {

        // Potential use of closest method. more research is needed

        // Loop Through And Delegate Events
        this.elements.forEach( parent => {

            // Filter Event Targets
            const delegate = event => {

                // Get Potential Target Nodes
                const nodes = parent.querySelectorAll( selector );
    
                const target = event.target;

                nodes.forEach( node => {

                    let current = target;

                    while ( current && current !== parent ) {
                        
                        if ( current === node ) return eventAction.call( node, event );

                        current = current.parentNode;

                    }

                });
    
            }

            // Attach Event Listener
            parent.addEventListener(eventType, delegate);

        });

        // Return Function To Be Chained
        return this.cycle();
    }


    async fadeInOut( period1, period2, doWork ) {
        // Set Opacity to 0
        this.css({
            opacity: 0
        });

        // Delay By Specified Period 1
        await this.constructor.timeout(period1);

        // Change Map Theme After FadeOut is Complete
        doWork();

        // Delay By Specified Period 2
        await this.constructor.timeout(period2);

        // Set Opacity to 0
        this.css({
            opacity: 1
        });

        return this.cycle();
    }


    async delay( time ) {
        await this.constructor.timeout(time);
        return this.cycle();
    }


    async animate( properties, transition ) {

        /*
        // Decalre Variables and functions
        const defaultTransition = 'all 2s ease-in';
        let transitionsComplete = 0;

        const callback = function() {
            console.log(this);
        }

        // 1. Change Transitions
        if ( transition )  this.elements.forEach(element => element.style.transition = transition );


        // 2. Get the Event Name
        const eventType = Assistant.getTransitionEndEventName();


        // 3. Attach Event Handler and Set Properties
        this.elements.forEach( element => {

            // Check If Element Has Transition Property
            if ( !element.style.transition && !element.style.transitionDuration ) element.style.transition = defaultTransition;

            // Assign Properties
            Object.assign(element.style, properties);

            // Attach Event Listener
            element.addEventListener(eventType, callback);

        });


        
/*

        const animation = () => {
            return new Promise( (resolve, reject) => {
                setTimeout( () => {
                    resolve('complete');
                }, 10000);
            });
        }
        
        const complete = await animation();
        */

        return this.cycle();
    }

    static timeout(ms) {
        return new Promise( resolve => setTimeout( resolve, ms ) );
    }


    // Get Transition Event Name
    static getTransitionEndEventName() {

        const transitions = {
            "transition"      : "transitionend",
            "OTransition"     : "oTransitionEnd",
            "MozTransition"   : "transitionend",
            "WebkitTransition": "webkitTransitionEnd"
        }

        let bodyStyle = document.body.style;

        for(let transition in transitions) {
            if(bodyStyle[transition] != undefined) {
                return transitions[transition];
            } 
        }

    }


    static usdFormat( x, prefix, suffix ) {

        if ( !x ) return `${!prefix ? "" : prefix }0.00${!suffix ? "" : suffix}`;

        return `${(x < 0) ? "-" : ""}${ !prefix ? "" : prefix }${Array.from( Math.abs(x).toFixed(2).split(".")[0] ).reverse().map( ( int, i, d ) => ( ( ( i + 1 ) % 3 ) === 0 && i !== ( d.length - 1 ) ) ? `,${int}` : int ).reverse().join("")}.${x.toFixed(2).split(".")[1]}${!suffix ? "" : suffix}`

        /*
        const num = x.toFixed(2).split(".");
  
        let dollars = Array.from( num[0] ).reverse();
        const cents = num[1];
        
        //console.log( dollars );
        
        dollars = dollars.map( ( int, i, d ) => {
            
            if ( ( ( i + 1 ) % 3 ) === 0 && i !== ( d.length - 1 ) ) return int = ',' + int;
            
            else return int
            
        }).reverse().join("");
        
        console.log(dollars);
        
        //console.log( num );
        
        return `$${dollars}.${cents}`

        */

    }


    static select( selector ) {

        return document.querySelectorAll(selector);

    }


    // Initialize Class
    static init( selector, index ) {

        const isElement = ( typeof selector === 'object' );

        return new Assistant({
            elements: isElement ? ( selector.length ? selector : [ selector ] ) : document.querySelectorAll( selector ),
            selector: isElement ? null : selector,
            getAll: isElement ? true : ( ( index || index === 0 ) ? false : true ),
            index: index,
            listeners: []
        });

    }

}


// Class To Assist With Ajax Requests
class phpRequest {

    constructor(props) {
        this.type = props.type;
        this.url = props.url;
        this.data = props.data;
        this.header = props.header;
    }

    send() {
        return new Promise( (resolve, reject) => {

            // Create Request
            const xhr = new XMLHttpRequest();
            xhr.open(this.type, this.url);
            if ( this.header ) xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

            // Attach Event Listener
            xhr.addEventListener('load', () => {
                if ( xhr.status === 200 ) resolve(xhr);
                else reject(xhr);
            });

            // Send Request
            if ( this.header ) xhr.send(this.data);
            else xhr.send();
        });

    }


    static queue(props) {

        const encodeForPost = data => {
            let encodedString = '';
            for (let prop in data) {
                if ( data.hasOwnProperty( prop ) ) {
                    if ( encodedString.length > 0 ) encodedString += '&';
                    encodedString += encodeURI(`${prop}=${data[prop]}`);
                }
            }
            return encodedString;
        }

        const encodeForGet = data => {
            let encodedString = '';
            for (let prop in data) {
                if ( data.hasOwnProperty( prop ) ) {
                    encodedString += `${ ( encodedString.length > 0 ) ? '&' : ''}${prop}=${data[prop]}`;
                } 
            }
            return `${props.url}?${encodedString}`;
        }

        return new phpRequest({
            type: props.type,
            url: ( props.type.toLowerCase() === 'get' ) ? encodeForGet(props.url) : props.url,
            data: ( props.type.toLowerCase() === 'post' ) ? encodeForPost(props.data) : props.data,
            header: ( props.type.toLowerCase() === 'post' ) ? true : false
        });
    }
}

// Bind Shortcut
export const ajax = phpRequest.queue;
export const domSelect = Assistant.init;
export const delay = async time => {
    await Assistant.timeout(time);
    return true;
}