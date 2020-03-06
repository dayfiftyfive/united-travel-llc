import { domSelect as $, ajax } from './Assistant';
import { logo, loader } from '../views/elements';
export default class Checkout {

    constructor( product, merchant, selector ) {
        this.title = product.title;
        this.price = product.price;
        this.tagline = product.tagline;
        this.description = product.description;
        this.img = product.img;
        this.label = product.label;
        this.merchant = merchant.toUpperCase();
        this.selector = $(selector);
        this.state = {
            status: 'null',
            paid: false,
            method: '',
            loaded: {
                rendered: false,
                square: false,
                paypal: false
            }
        };
        this.minLoadTime = 2000;
    }

    pending() {

    }

    square() {

        const product = {
            title: this.title,
            price: this.price,
            description: this.description,
            img: this.img,
            label: this.label,
            merchant: this.merchant,
        }

        const ajaxurl = '../checkout/process-card.php';

        // Create and initialize a payment form object
        const paymentForm = new SqPaymentForm({

            applicationId: "sandbox-sq0idb-Vm1E4Lk9nHYcuk606b-XsA",
            locationId: "ZDDKPX6X303P5",
            inputClass: 'sq-input',
            autoBuild: false,

            inputStyles: [{
                fontSize: '16px',
                lineHeight: '55px',
                padding: '0 16px',
                placeholderColor: '#a0a0a0',
                backgroundColor: 'transparent'
            }],

            googlePay: {
                elementId: 'sq-google-pay'
            },

            cardNumber: {
                elementId: 'sq-card-number',
                placeholder: '• • • •  • • • •  • • • •  • • • •'
            },
            cvv: {
                elementId: 'sq-cvv',
                placeholder: 'CVV'
            },
            expirationDate: {
                elementId: 'sq-expiration-date',
                placeholder: 'MM/YY'
            },
            postalCode: {
                elementId: 'sq-postal-code',
                placeholder: 'ZIP'
            },

            callbacks: {

                paymentFormLoaded: () => {
                    this.loadComplete('square');
                },

                cardNonceResponseReceived: function (errors, nonce, cardData) {

                    if ( errors ) {
                        console.error('Encountered errors:');

                        errors.forEach(function (error) {
                            console.error('  ' + error.message);
                        });

                        return;
                    }

                    ajax({
                        type: 'POST',
                        url: ajaxurl,
                        data: {
                            price: product.price * 100,
                            nonce: nonce
                        }
                    })
                    .send()
                    .catch(err => console.error("A network error has occured:" + err))
                    .then(response => {

                        if ( response.responseText === 'error' ) return Promise.reject();

                        return Promise.resolve( JSON.parse(response.responseText) );

                    })
                    .catch(err => {
                        console.log('your payment could not be processed');
                    })
                    .then(data => {
                        console.log(data);
                    });

                },

                methodsSupported: function (methods, unsupportedReason) {


                    var googlePayBtn = document.getElementById('sq-google-pay');

                    // Only show the button if Google Pay on the Web is enabled
                    if (methods.googlePay === true) {
                        googlePayBtn.style.display = 'inline-block';
                    }
                },

                createPaymentRequest: function () {

                    var paymentRequestJson = {
                        requestShippingAddress: false,
                        requestBillingInfo: true,
                        currencyCode: "USD",
                        countryCode: "US",
                        total: {
                            label: product.merchant,
                            amount: product.price.toFixed(2),
                            pending: false
                        },
                        lineItems: [
                            {
                                label: product.label,
                                amount: product.price.toFixed(2),
                                pending: false
                            }
                        ]
                    };

                    return paymentRequestJson;
                }
            }
        });

        // Build Form
        paymentForm.build();


        this.selector.listenFor("click", "button.button-credit-card", e => {

            e.preventDefault();

            this.state.status = 'pending';

            paymentForm.requestCardNonce();

        });

    }

    paypal() {

        const product = {
            title: this.title,
            price: this.price,
            description: this.description,
            img: this.img,
            label: this.label,
            merchant: this.merchant,
        }

        paypal.Buttons({

            style: {
                layout: 'horizontal',
                tagline: false,
                color: 'black',
                height: 45
            },

            fundingSource: paypal.FUNDING.PAYPAL,

            createOrder: function( data, actions ) {
                return actions.order.create({
                    purchase_units: [{
                        description: product.description,
                        amount: {
                            value: product.price
                        }
                    }]
                });
            },

            onApprove: async ( data, actions ) => {
        
                const order = await actions.order.capture();
                console.log(order);
                console.log(data);
        
            }
        
        }).render('#paypal-button-container').then(r => this.loadComplete('paypal') );
    }

    destroy() {
        console.log('destroy the checkout form');
    }

    load() {

        this.paypal();
        this.square();

    }

    loadComplete( key ) {

        this.state.loaded[ key ] = true;
        
        if ( !this.state.loaded.rendered || !this.state.loaded.paypal || !this.state.loaded.square ) return;

        this.loadFinish = new Date();
        this.elapsedTime = this.loadFinish - this.loadStart;
        const time = ( this.elapsedTime > this.minLoadTime ) ? 0 : ( this.minLoadTime - this.elapsedTime );
        
        setTimeout( () => {

            // Remove Loader
            this.loader.css({
                opacity: "0"
            })
            .delay(500)
            .then(l => l.remove() )
            .then(l => this.form.switchClass("hidden", "transparent") )
            .then(f => f.delay(200) )
            .then(f => f.removeClass("transparent") );

        }, time );

    }

    render() {

        const markup = `
        <div class="checkout__block hidden">
            <div class="checkout__header">
                <div class="checkout__logo">
                    ${logo}
                </div>
                <h2 class="checkout__title">Complete Booking</h2>
                <h4 class="checkout__subtitle">${this.tagline}</h4>
            </div>
            <div class="checkout__form">
                <div id="sq-card-number"></div>
                <div class="" id="sq-expiration-date"></div>
                <div class="" id="sq-cvv"></div>
                <div class="" id="sq-postal-code"></div>
                <button id="sq-creditcard" class="button-credit-card">Pay $${this.price.toFixed(2)}</button>
                <div class="checkout__divider"><span>or pay with</span></div>
                <div class="checkout__wallets">
                    <button id="sq-google-pay" class="button-google-pay"></button>
                    <div id="paypal-button-container"></div>
                </div>
            </div>
        </div>`;

        // Insert Loader And Markup
        this.selector.insert('afterbegin', loader).insert('beforeend', markup);

        // Get Loader Element
        this.loader = $('.checkout .loader');

        // Get Form
        this.form = $('.checkout .checkout__block');

        // Indicate That Rendering Has Completed
        this.loadComplete('rendered');

        // Set Elapsed Loading Timer
        this.loadStart = new Date();

        // Load Payments
        this.load();

    }

}