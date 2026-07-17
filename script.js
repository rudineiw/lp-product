document.addEventListener('DOMContentLoaded', () => {
    // Seleção de elementos das etapas
    const shippingCard = document.getElementById('shippingCard');
    const checkoutCard = document.getElementById('checkoutCard');
    const orderForm = document.getElementById('orderForm');
    const feedbackMessage = document.getElementById('feedbackMessage');

    // Elementos da calculadora de frete
    const cepInput = document.getElementById('cep');
    const btnCalcShipping = document.getElementById('btnCalcShipping');
    const cepError = document.getElementById('cepError');
    const shippingResult = document.getElementById('shippingResult');
    const shippingValue = document.getElementById('shippingValue');
    const shippingTime = document.getElementById('shippingTime');
    const btnProceedToCheckout = document.getElementById('btnProceedToCheckout');

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

    // Função centralizada para consultar o CEP e processar regras
    async function handleShippingCalculation() {
        const cep = cepInput.value.replace(/\D/g, '');
        cepError.textContent = '';
        shippingResult.classList.add('hidden');
        checkoutCard.classList.add('hidden'); // Oculta o checkout caso mude de CEP

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

            // Guarda temporariamente os dados para a próxima etapa
            addressInput.value = data.logradouro || '';
            neighborhoodInput.value = data.bairro || '';
            cityInput.value = `${data.localidade} / ${data.uf}`;

            // Calcula e exibe o frete
            const rule = shippingRules[data.uf] || shippingRules['default'];
            shippingValue.textContent = rule.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            shippingTime.textContent = `${rule.days} dias úteis`;

            // Mostra o resultado da simulação
            shippingResult.classList.remove('hidden');

            // Armazena o valor de frete atual para o checkout
            shippingResult.dataset.shippingPrice = rule.price;
            shippingResult.dataset.shippingDays = rule.days;

        } catch (error) {
            cepError.textContent = 'Erro ao consultar o CEP. Tente novamente.';
            console.error(error);
        }
    }

    // Gatilhos para o cálculo do frete (Clique ou Tecla Enter)
    btnCalcShipping.addEventListener('click', handleShippingCalculation);
    cepInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleShippingCalculation();
    });

    // ETAPA 2: Ao clicar em "Comprar Agora", revela o formulário de dados cadastrais
    btnProceedToCheckout.addEventListener('click', () => {
        checkoutCard.classList.remove('hidden');
        checkoutCard.scrollIntoView({ behavior: 'smooth' });
        
        if (!nameInput.value) {
            nameInput.focus(); // Se não digitou o nome ainda, começa por aqui
        } else if (!addressInput.value) {
            addressInput.focus(); // Se o nome já existe mas a rua veio vazia (CEP geral), foca na rua
        } else {
            document.getElementById('email').focus(); // Caso contrário, vai para o e-mail
        }
    });

    // Envio do pedido completo
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
        window.location.href = 'pedido.html';
    });
});