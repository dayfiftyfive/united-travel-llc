import Checkout from './models/Checkout';
import { domSelect as $, delay } from './models/Assistant';
import GMap from './models/Maps';

// Application State Management
window.state = {};

// Set Window Theme
window.theme = ( window.matchMedia("(prefers-color-scheme: dark)").matches ) ? 'dark' : 'light';


// Load Page
window.addEventListener('load', async () => {

    $('.preload__spinner').css({
        border: "var(--spinner-border) var(--accent-color)",
        animation: "none"
    });

    await delay(1000);

    $('.preload').css({
        opacity: "0"
    }).delay(1000).then(r => r.remove());


});


// Control Checkout 
const controlCheckout = () => {

    // INITIALIZE CHECKOUT 
    const trip = {
        title: 'Fare',
        tagline: 'Book your ride for March 21, 2020',
        price: 22.08,
        description: 'Total Trip Cost',
        img: '',
        label: 'Total Fare'
    }
    const checkout = new Checkout(trip, 'United Travel LLC', '.checkout__window');
    checkout.render();



    const map = new GMap(".final-map-canvas");
    map.render();


    // Manage Color Theme Event Listeners
    {

        window.matchMedia("(prefers-color-scheme: dark)").addListener( e => {

            if (!e.matches) return;
            window.theme = 'dark';

            map.changeTheme();
            checkout.changeTheme();

        });

        window.matchMedia("(prefers-color-scheme: light)").addListener( e => {

            if (!e.matches) return;
            window.theme = 'light';

            map.changeTheme();
            checkout.changeTheme();


        });

    }

}