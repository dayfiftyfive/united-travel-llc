import Checkout from './models/Checkout';

const controlCheckout = () => {

}

// INITIALIZE CHECKOUT 
const trip = {
    title: 'Fare',
    tagline: 'Book your ride for March 14, 2020',
    price: 1.55,
    description: 'Total Trip Cost',
    img: '',
    label: 'Total Fare'
}

const checkout = new Checkout(trip, 'United Travel LLC', '.checkout');

//checkout.load();
//checkout.render();

checkout.render();