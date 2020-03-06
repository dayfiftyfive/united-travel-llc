class Checkout {

    constructor( product, merchant, selector ) {
        this.title = product.title;
        this.price = product.price;
        this.description = product.description;
        this.img = product.img;
        this.label = product.label;
        this.merchant = merchant.toUpperCase();
    }

    square() {

        // Create and initialize a payment form object
        const paymentForm = new SqPaymentForm({

            applicationId: "sandbox-sq0idb-Vm1E4Lk9nHYcuk606b-XsA",
            locationId: "ZDDKPX6X303P5",
            inputClass: 'sq-input',
            autoBuild: false,

            inputStyles: [{
                fontSize: '16px',
                lineHeight: '24px',
                padding: '16px',
                placeholderColor: '#a0a0a0',
                backgroundColor: 'transparent',
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
                placeholder: 'Postal'
            },

            callbacks: {

                paymentFormLoaded: function() {
                    console.log('nigga we made it');
                },

                cardNonceResponseReceived: function (errors, nonce, cardData) {

                    if ( errors ) {
                        console.error('Encountered errors:');

                        errors.forEach(function (error) {
                            console.error('  ' + error.message);
                        });

                        return;
                    }

                    $php({
                        type: 'POST',
                        url: './process-card.php',
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
                            amount: product.price,
                            pending: false
                        },
                        lineItems: [
                            {
                                label: product.label,
                                amount: product.price,
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

        function onGetCardNonce(event) {
            event.preventDefault();
            paymentForm.requestCardNonce();
        }

    }

    paypal() {

        paypal.Buttons({

            style: {
                layout: 'horizontal',
                tagline: false,
                color: 'black'
            },

            fundingSource: paypal.FUNDING.PAYPAL,

            createOrder: function( data, actions ) {
                return actions.order.create({
                    purchase_units: [{
                        description: this.description,
                        amount: {
                            value: this.price
                        }
                    }]
                });
            },

            onApprove: async ( data, actions ) => {
        
                const order = await actions.order.capture();
                console.log(order);
                console.log(data);
        
            }
        
        }).render('#paypal-button-container');
    }

    load() {
       this.paypal();
       this.square();
    }

    render() {

        const form = `
        <div id="sq-card-number"></div>
        <div class="third" id="sq-expiration-date"></div>
        <div class="third" id="sq-cvv"></div>
        <div class="third" id="sq-postal-code"></div>
        <button id="sq-creditcard" class="button-credit-card" onclick="onGetCardNonce(event)">Pay $${this.price.toFixed(2)} Now</button>
        <button id="sq-google-pay" class="button-google-pay"></button>
        <div id="paypal-button-container"></div>`;

    }

}



// INITIALIZE CHECKOUT 
const trip = {
    title: 'Fare',
    price: 1.55,
    description: 'Total Trip Cost',
    img: '',
    label: 'Total Fare'
}

const checkout = new Checkout(trip, 'United Travel LLC');