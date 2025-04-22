document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const tabs = document.querySelectorAll('.tab-button');
    const converterSections = document.querySelectorAll('.converter-section');
    const swapButtons = document.querySelectorAll('.swap-button');

    // Input and Select elements (grouped by type)
    const elements = {
        temperature: {
            input: document.getElementById('tempInput'),
            fromUnit: document.getElementById('tempFromUnit'),
            toUnit: document.getElementById('tempToUnit'),
            resultArea: document.getElementById('tempResultArea').querySelector('.result-value')
        },
        length: {
            input: document.getElementById('lengthInput'),
            fromUnit: document.getElementById('lengthFromUnit'),
            toUnit: document.getElementById('lengthToUnit'),
            resultArea: document.getElementById('lengthResultArea').querySelector('.result-value')
        },
        weight: {
            input: document.getElementById('weightInput'),
            fromUnit: document.getElementById('weightFromUnit'),
            toUnit: document.getElementById('weightToUnit'),
            resultArea: document.getElementById('weightResultArea').querySelector('.result-value')
        },
        currency: {
            input: document.getElementById('currencyInput'),
            fromUnit: document.getElementById('currencyFromUnit'),
            toUnit: document.getElementById('currencyToUnit'),
            resultArea: document.getElementById('currencyResultArea').querySelector('.result-value')
        }
    };

    // Placeholder Currency Rates (relative to USD) - Needs API for real rates!
    const currencyRates = {
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        JPY: 150.50
    };

    // --- Functions ---

    // Switch Active Tab and Converter Section
    function switchTab(targetConverter) {
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.converter === targetConverter);
        });
        converterSections.forEach(section => {
            section.classList.toggle('active', section.id === targetConverter);
        });
        // Trigger conversion on switch for potentially pre-filled values
        performConversion(targetConverter);
    }

    // Perform the correct conversion based on active type
    function performConversion(type) {
        const els = elements[type];
        if (!els || !els.input || !els.fromUnit || !els.toUnit || !els.resultArea) return; // Ensure elements exist

        const fromUnit = els.fromUnit.value;
        const toUnit = els.toUnit.value;
        const inputValue = parseFloat(els.input.value);

        if (isNaN(inputValue)) {
            els.resultArea.textContent = '-';
            return;
        }

        let result;
        try {
            switch (type) {
                case 'temperature':
                    result = convertTemperature(inputValue, fromUnit, toUnit);
                    break;
                case 'length':
                    result = convertLength(inputValue, fromUnit, toUnit);
                    break;
                case 'weight':
                    result = convertWeight(inputValue, fromUnit, toUnit);
                    break;
                case 'currency':
                    result = convertCurrency(inputValue, fromUnit, toUnit);
                    break;
                default:
                    result = '-';
            }
            // Format result nicely
            els.resultArea.textContent = formatResult(result, type);
        } catch (error) {
            console.error("Conversion Error:", error);
            els.resultArea.textContent = 'Error';
        }
    }

    // Format the numerical result
    function formatResult(value, type) {
        if (value === null || value === undefined || value === '-') return '-';
        if (typeof value !== 'number') return value; // Handle potential string results like 'Error'

        let decimals = 2; // Default
        if (type === 'temperature') decimals = 1;
        if (type === 'length' || type === 'weight') decimals = 3;
        if (type === 'currency') {
             // Special handling for JPY which usually has no decimals
            const toUnit = elements.currency.toUnit.value;
            decimals = (toUnit === 'JPY') ? 0 : 2;
        }

        // Use toLocaleString for better number formatting (commas) and control decimals
        return value.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    // --- Conversion Logic Functions ---

    function convertTemperature(value, from, to) {
        if (from === to) return value;
        let celsiusValue;

        // Convert input to Celsius first
        if (from === 'F') celsiusValue = (value - 32) * 5 / 9;
        else if (from === 'K') celsiusValue = value - 273.15;
        else celsiusValue = value; // Already Celsius

        // Convert Celsius to target unit
        if (to === 'F') return (celsiusValue * 9 / 5) + 32;
        if (to === 'K') return celsiusValue + 273.15;
        return celsiusValue; // To Celsius
    }

    function convertLength(value, from, to) {
        if (from === to) return value;
        const meterFactors = { m: 1, km: 1000, ft: 0.3048, mi: 1609.34 };
        const valueInMeters = value * meterFactors[from];
        return valueInMeters / meterFactors[to];
    }

    function convertWeight(value, from, to) {
        if (from === to) return value;
        const kgFactors = { kg: 1, g: 0.001, lb: 0.453592, oz: 0.0283495 };
        const valueInKg = value * kgFactors[from];
        return valueInKg / kgFactors[to];
    }

    function convertCurrency(value, from, to) {
        if (from === to) return value;
        if (!currencyRates[from] || !currencyRates[to]) {
            throw new Error("Invalid currency code or missing rate");
        }
        const valueInUSD = value / currencyRates[from];
        return valueInUSD * currencyRates[to];
    }


    // Swap units for a given type
    function swapUnits(type) {
         const els = elements[type];
         if (!els || !els.fromUnit || !els.toUnit) return;

         const fromVal = els.fromUnit.value;
         const toVal = els.toUnit.value;

         els.fromUnit.value = toVal;
         els.toUnit.value = fromVal;

         // Trigger conversion after swap
         performConversion(type);
    }


    // --- Event Listeners ---

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.converter);
        });
    });

    // Conversion on input/select change for all sections
    Object.keys(elements).forEach(type => {
        const els = elements[type];
        if (els.input) els.input.addEventListener('input', () => performConversion(type));
        if (els.fromUnit) els.fromUnit.addEventListener('change', () => performConversion(type));
        if (els.toUnit) els.toUnit.addEventListener('change', () => performConversion(type));
    });

     // Swap button clicks
    swapButtons.forEach(button => {
        button.addEventListener('click', () => {
            swapUnits(button.dataset.type);
        });
    });


    // --- Initial Setup ---
    switchTab('temperature'); // Activate the first tab on load

}); // End DOMContentLoaded
