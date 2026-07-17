document.addEventListener('DOMContentLoaded', () => {

    // LÓGICA DA PÁGINA DE CHECKOUT (PEDIDO)
    const shippingCard = document.getElementById('shippingCard');
    if (shippingCard) {
        const checkoutCard = document.getElementById('checkoutCard');
        const orderForm = document.getElementById('orderForm');
        const feedbackMessage = document.getElementById('feedbackMessage');

        // Elementos da calculadora de frete
        const cepInput = document.getElementById('cep');
        const btnCalcShipping = document.getElementById('btnCalcShipping');
        const cepError = document.getElementById('cepError');
        const shippingResult = document.getElementById('shippingResult');
        const shippingValue = document.getElementById('shippingValue');
        const totalValue = document.getElementById('totalValue');
        const shippingTime = document.getElementById('shippingTime');

        // Inputs do formulário final
        const nameInput = document.getElementById('name');
        const addressInput = document.getElementById('address');
        const neighborhoodInput = document.getElementById('neighborhood');
        const cityInput = document.getElementById('city');

        const productPrice = 197.00;

        // Tabela de frete fictício
        const shippingRules = {
            'RS': { price: 12.90, days: 3 },
            'SC': { price: 15.90, days: 4 },
            'PR': { price: 17.90, days: 5 },
            'SP': { price: 22.50, days: 6 },
            'RJ': { price: 24.90, days: 7 },
            'MG': { price: 24.90, days: 7 },
            'default': { price: 35.00, days: 10 }
        };

        async function handleShippingCalculation() {
            const cep = cepInput.value.replace(/\D/g, '');
            cepError.textContent = '';
            shippingResult.classList.add('hidden');
            checkoutCard.classList.add('hidden');

            if (cep.length !== 8) {
                cepError.textContent = 'O CEP deve conter exatamente 8 números.';
                return;
            }

            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                if (!response.ok) throw new Error('Erro na requisição.');

                const data = await response.json();

                if (data.erro) {
                    cepError.textContent = 'CEP não encontrado.';
                    return;
                }

                addressInput.value = data.logradouro || '';
                neighborhoodInput.value = data.bairro || '';
                cityInput.value = `${data.localidade} / ${data.uf}`;

                const rule = shippingRules[data.uf] || shippingRules['default'];
                shippingValue.textContent = rule.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                const totalPrice = productPrice + rule.price;
                totalValue.textContent = totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                shippingTime.textContent = `${rule.days} dias úteis`;

                shippingResult.classList.remove('hidden');
                shippingResult.dataset.shippingPrice = rule.price;
                shippingResult.dataset.shippingDays = rule.days;

                // Exibe o formulário de dados cadastrais após informar CEP válido
                checkoutCard.classList.remove('hidden');
                
                if (!nameInput.value) {
                    nameInput.focus();
                } else if (!addressInput.value) {
                    addressInput.focus();
                } else {
                    document.getElementById('email').focus();
                }

            } catch (error) {
                cepError.textContent = 'Erro ao consultar o CEP. Tente novamente.';
                console.error(error);
            }
        }

        btnCalcShipping.addEventListener('click', handleShippingCalculation);
        cepInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleShippingCalculation();
        });

        orderForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const shippingPrice = parseFloat(shippingResult.dataset.shippingPrice || 0);
            const shippingDays = shippingResult.dataset.shippingDays || 'N/A';
            const totalPrice = productPrice + shippingPrice;

            const orderData = {
                name: nameInput.value.trim(),
                email: document.getElementById('email').value.trim(),
                address: addressInput.value.trim(),
                neighborhood: neighborhoodInput.value.trim(),
                city: cityInput.value.trim(),
                productPrice,
                shippingPrice,
                shippingDays,
                totalPrice
            };

            localStorage.setItem('mysteryProductOrder', JSON.stringify(orderData));

            // Injeta dados no resumo dinâmico da tela de sucesso
            document.getElementById('successName').textContent = orderData.name;
            document.getElementById('successEmail').textContent = orderData.email;
            document.getElementById('successAddress').textContent = `${orderData.address}, ${orderData.neighborhood} - ${orderData.city}`;
            
            document.getElementById('successProductValue').textContent = orderData.productPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            document.getElementById('successShippingValue').textContent = orderData.shippingPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            document.getElementById('successShippingDays').textContent = orderData.shippingDays === 'N/A' ? 'Informação indisponível' : `${orderData.shippingDays} dias úteis`;
            document.getElementById('successTotalValue').textContent = orderData.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            shippingCard.classList.add('hidden');
            checkoutCard.classList.add('hidden');
            feedbackMessage.classList.remove('hidden');
            
            feedbackMessage.scrollIntoView({ behavior: 'smooth' });
        });

        document.getElementById('backToHome').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // LÓGICA DA PÁGINA DE CONTATO
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const contactCard = document.getElementById('contactCard');
        const contactFeedback = document.getElementById('contactFeedback');
        const btnBackHome = document.getElementById('btnBackHome');

        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();

            contactCard.classList.add('hidden');
            contactFeedback.classList.remove('hidden');
        });

        btnBackHome.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
});