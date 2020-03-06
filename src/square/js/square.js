function initSquare(product) {

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

    document.getElementById('sq-creditcard').innerHTML = `Pay $${product.price.toFixed(2)}`;

}