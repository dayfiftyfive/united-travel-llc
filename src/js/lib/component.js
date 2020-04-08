import Store from '../store/store';

export default class Component {

    constructor( props = {} ) {
        
        let that = this;
        
        this.render = this.render || function() {};

        if ( props.store instanceof Store ) {
            props.store.events.subscribe('stateChange', () => that.render());
        }

        if ( props.hasOwnProperty('element') ) {
            this.element = props.element;
        }
    }

}