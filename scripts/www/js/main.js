// 计算器核心逻辑
class CalculatorApp {
    constructor() {
        this.init();
    }

   init() {
    // 初始化所有事件监听
    this.initEventListeners();
    this.initModalControls();
    this.initInputValidations();
    
    // 页面加载完成后隐藏启动界面
    this.initSplashScreen();
}

initSplashScreen() {
    // 确保页面内容已加载
    document.addEventListener('DOMContentLoaded', () => {
        // 设置最小显示时间（毫秒）
        const minDisplayTime = 1500;
        const startTime = Date.now();
        
        // 检查所有资源是否已加载
        const hideSplashScreen = () => {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minDisplayTime - elapsedTime);
            
            setTimeout(() => {
                const splashScreen = document.getElementById('splash-screen');
                if (splashScreen) {
                    // 添加淡出动画
                    splashScreen.classList.add('fade-out');
                    
                    // 动画完成后移除元素
                    setTimeout(() => {
                        splashScreen.style.display = 'none';
                    }, 500);
                }
            }, remainingTime);
        };
        
        // 如果所有资源已加载，或者3秒后强制隐藏
        if (document.readyState === 'complete') {
            hideSplashScreen();
        } else {
            window.addEventListener('load', hideSplashScreen);
            
            // 安全网：3秒后强制隐藏
            setTimeout(hideSplashScreen, 3000);
        }
    });
}

    initEventListeners() {
        // 面板切换
        const btnScrap = document.getElementById('btn-scrap');
        const btnShavings = document.getElementById('btn-shavings');
        const panelScrap = document.getElementById('panel-scrap');
        const panelShavings = document.getElementById('panel-shavings');
        const infoScrap = document.getElementById('info-scrap');
        const infoShavings = document.getElementById('info-shavings');

        btnScrap.addEventListener('click', () => {
            this.switchPanel('scrap');
        });
        
        btnShavings.addEventListener('click', () => {
            this.switchPanel('shavings');
        });

        // 含钼废钢计算器
        document.getElementById('calculate-scrap').addEventListener('click', () => this.calculateScrap());
        document.getElementById('reset-scrap').addEventListener('click', () => this.resetScrap());
        document.getElementById('y-percent').addEventListener('input', () => this.updateZFactor());
        
        // 含钼刨花计算器
        document.getElementById('calculate-shavings').addEventListener('click', () => this.calculateShavings());
        document.getElementById('reset-shavings').addEventListener('click', () => this.resetShavings());

        // 计算详情折叠控制
        document.getElementById('toggle-details-scrap').addEventListener('click', () => this.toggleDetails('scrap'));
        document.getElementById('toggle-details-shavings').addEventListener('click', () => this.toggleDetails('shavings'));
    }

    initModalControls() {
        const btnHelp = document.getElementById('btn-help');
        const btnAbout = document.getElementById('btn-about');
        const modalHelp = document.getElementById('modal-help');
        const modalAbout = document.getElementById('modal-about');
        const closeHelp = document.getElementById('close-help');
        const closeAbout = document.getElementById('close-about');
        
        btnHelp.addEventListener('click', () => modalHelp.classList.remove('hidden'));
        btnAbout.addEventListener('click', () => modalAbout.classList.remove('hidden'));
        closeHelp.addEventListener('click', () => modalHelp.classList.add('hidden'));
        closeAbout.addEventListener('click', () => modalAbout.classList.add('hidden'));
        
        // 点击模态框外部关闭
        window.addEventListener('click', (event) => {
            if (event.target === modalHelp) modalHelp.classList.add('hidden');
            if (event.target === modalAbout) modalAbout.classList.add('hidden');
        });
    }

    initInputValidations() {
        const inputs = document.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                // 防止输入负数
                if (this.value < 0) {
                    this.value = '';
                }
            });
        });
    }

    switchPanel(type) {
        const isScrap = type === 'scrap';
        
        // 切换面板显示
        document.getElementById('panel-scrap').classList.toggle('hidden', !isScrap);
        document.getElementById('panel-shavings').classList.toggle('hidden', isScrap);
        document.getElementById('info-scrap').classList.toggle('hidden', !isScrap);
        document.getElementById('info-shavings').classList.toggle('hidden', isScrap);
        
        // 切换按钮样式
        const btnScrap = document.getElementById('btn-scrap');
        const btnShavings = document.getElementById('btn-shavings');
        
        if (isScrap) {
            btnScrap.classList.remove('bg-secondary', 'hover:bg-gray-600');
            btnScrap.classList.add('bg-accent', 'hover:bg-orange-600');
            btnShavings.classList.remove('bg-accent', 'hover:bg-orange-600');
            btnShavings.classList.add('bg-secondary', 'hover:bg-gray-600');
        } else {
            btnShavings.classList.remove('bg-secondary', 'hover:bg-gray-600');
            btnShavings.classList.add('bg-accent', 'hover:bg-orange-600');
            btnScrap.classList.remove('bg-accent', 'hover:bg-orange-600');
            btnScrap.classList.add('bg-secondary', 'hover:bg-gray-600');
        }
    }

    updateZFactor() {
        const yPercent = parseFloat(document.getElementById('y-percent').value);
        let zFactor = 0;
        
        if (!isNaN(yPercent)) {
            if (yPercent < 0.2) {
                zFactor = 70;
            } else if (yPercent >= 0.2 && yPercent < 0.3) {
                zFactor = 75;
            } else {
                zFactor = 80;
            }
            
            document.getElementById('z-factor').value = zFactor;
        } else {
            document.getElementById('z-factor').value = '';
        }
    }

    calculateScrap() {
        const pt = parseFloat(document.getElementById('pt-scrap').value);
        const yPercent = parseFloat(document.getElementById('y-percent').value);
        const pm = parseFloat(document.getElementById('pm-scrap').value);
        const weight = parseFloat(document.getElementById('weight-scrap').value) || 1;
        const taxRate = parseFloat(document.getElementById('tax-rate-scrap').value) || 12.5;
        const cost = parseFloat(document.getElementById('cost-scrap').value) || 0;
        
        if (isNaN(pt) || isNaN(yPercent) || isNaN(pm)) {
            alert('请填写所有必填字段！');
            return;
        }
        
        // 根据钼含量计算回收率系数Z
        let zFactor = 0;
        let zRange = '';
        
        if (yPercent < 0.2) {
            zFactor = 70;
            zRange = 'Y < 0.2%';
        } else if (yPercent >= 0.2 && yPercent < 0.3) {
            zFactor = 75;
            zRange = '0.2% ≤ Y < 0.3%';
        } else {
            zFactor = 80;
            zRange = 'Y ≥ 0.3%';
        }
        
        // 计算单价（含税）
        const y = yPercent / 100;
        const z = zFactor / 100;
        const unitPrice = pt * (1 - y) + (pm / 0.6 * y * z);
        
        // 计算不含税价格
        const taxFactor = taxRate / 100;
        const unitPriceExclTax = unitPrice * (1 - taxFactor);
        
        // 计算费用后价格
        const unitPriceWithCost = unitPriceExclTax - cost;
        
        // 计算总价
        const totalPrice = unitPrice * weight;
        const totalPriceExclTax = unitPriceExclTax * weight;
        const totalPriceWithCost = unitPriceWithCost * weight;
        
        // 显示结果
        this.displayResults('scrap', {
            unitPrice,
            unitPriceExclTax,
            unitPriceWithCost,
            totalPrice,
            totalPriceExclTax,
            totalPriceWithCost,
            weight,
            yPercent,
            zFactor,
            zRange,
            pt,
            pm,
            taxRate,
            cost
        });
    }

    calculateShavings() {
        const basePrice = parseFloat(document.getElementById('base-price').value);
        const moContent = parseFloat(document.getElementById('mo-content').value);
        const weight = parseFloat(document.getElementById('weight-shavings').value) || 1;
        const taxRate = parseFloat(document.getElementById('tax-rate-shavings').value) || 12;
        const cost = parseFloat(document.getElementById('cost-shavings').value) || 0;
        
        if (isNaN(basePrice) || isNaN(moContent)) {
            alert('请填写所有必填字段！');
            return;
        }
        
        // 确定钼含量加价
        let moAddition = 0;
        let range = '';
        
        if (moContent >= 0.15 && moContent < 0.2) {
            moAddition = 300;
            range = '0.15% ≤ Mo < 0.2%';
        } else if (moContent >= 0.2 && moContent < 0.3) {
            moAddition = 450;
            range = '0.2% ≤ Mo < 0.3%';
        } else if (moContent >= 0.3 && moContent < 0.4) {
            moAddition = 650;
            range = '0.3% ≤ Mo < 0.4%';
        } else if (moContent >= 0.4) {
            moAddition = 900;
            range = 'Mo ≥ 0.4%';
        } else {
            alert('钼含量必须大于或等于0.15%！');
            return;
        }
        
        // 计算单价（含税）
        const unitPrice = basePrice + moAddition;
        
        // 计算不含税价格
        const taxFactor = taxRate / 100;
        const unitPriceExclTax = unitPrice * (1 - taxFactor);
        
        // 计算费用后价格
        const unitPriceWithCost = unitPriceExclTax - cost;
        
        // 计算总价
        const totalPrice = unitPrice * weight;
        const totalPriceExclTax = unitPriceExclTax * weight;
        const totalPriceWithCost = unitPriceWithCost * weight;
        
        // 显示结果
        this.displayResults('shavings', {
            unitPrice,
            unitPriceExclTax,
            unitPriceWithCost,
            totalPrice,
            totalPriceExclTax,
            totalPriceWithCost,
            weight,
            moContent,
            basePrice,
            moAddition,
            range,
            taxRate,
            cost
        });
    }

    displayResults(type, data) {
        const suffix = type === 'scrap' ? 'scrap' : 'shavings';
        const resultDiv = document.getElementById(`result-${suffix}`);
        
        // 显示单价
        document.getElementById(`unit-price-${suffix}`).textContent = `${data.unitPrice.toFixed(2)} 元/吨`;
        document.getElementById(`unit-price-excl-tax-${suffix}`).textContent = `${data.unitPriceExclTax.toFixed(2)} 元/吨`;
        document.getElementById(`unit-price-with-cost-${suffix}`).textContent = `${data.unitPriceWithCost.toFixed(2)} 元/吨`;
        
        // 显示总价
        const totalSection = document.getElementById(`total-price-${suffix}-section`);
        if (data.weight > 0) {
            document.getElementById(`total-price-${suffix}`).textContent = `${data.totalPrice.toFixed(2)} 元`;
            document.getElementById(`total-price-excl-tax-${suffix}`).textContent = `${data.totalPriceExclTax.toFixed(2)} 元`;
            document.getElementById(`total-price-with-cost-${suffix}`).textContent = `${data.totalPriceWithCost.toFixed(2)} 元`;
            totalSection.classList.remove('hidden');
        } else {
            totalSection.classList.add('hidden');
        }
        
        // 显示计算详情
        const detailsDiv = document.getElementById(`calculation-details-${suffix}`);
        detailsDiv.innerHTML = this.generateDetailsHTML(type, data);
        
        // 显示结果区域
        resultDiv.classList.remove('hidden');
        
        // 滚动到结果区域
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    generateDetailsHTML(type, data) {
        if (type === 'scrap') {
            const y = data.yPercent / 100;
            const z = data.zFactor / 100;
            
            return `
                Pt = ${data.pt} 元/吨<br>
                Y = ${data.yPercent}%<br>
                Pm = ${data.pm} 元/吨<br>
                Z = ${data.zFactor}% (${data.zRange})<br>
                税率 = ${data.taxRate}%<br>
                费用 = ${data.cost} 元/吨<br>
                重量 = ${data.weight} 吨<br><br>
                计算公式：Pt×（1-Y）+（Pm÷60%×Y×Z）<br>
                含税价格 = ${data.pt}×（1-${data.yPercent}%）+（${data.pm}÷60%×${data.yPercent}%×${data.zFactor}%）<br>
                含税价格 = ${data.pt}×${(1 - y).toFixed(4)} +（${data.pm}÷${0.6}×${y.toFixed(4)}×${data.zFactor/100}）<br>
                含税价格 = ${(data.pt * (1 - y)).toFixed(2)} + ${(data.pm / 0.6 * y * z).toFixed(2)}<br>
                含税单价 = ${data.unitPrice.toFixed(2)} 元/吨<br><br>
                不含税单价 = ${data.unitPrice.toFixed(2)} × (1 - ${data.taxRate}%) = ${data.unitPriceExclTax.toFixed(2)} 元/吨<br>
                费用后单价 = ${data.unitPriceExclTax.toFixed(2)} - ${data.cost} = ${data.unitPriceWithCost.toFixed(2)} 元/吨<br><br>
                含税总价 = ${data.unitPrice.toFixed(2)} × ${data.weight} = ${data.totalPrice.toFixed(2)} 元<br>
                不含税总价 = ${data.unitPriceExclTax.toFixed(2)} × ${data.weight} = ${data.totalPriceExclTax.toFixed(2)} 元<br>
                费用后总价 = ${data.unitPriceWithCost.toFixed(2)} × ${data.weight} = ${data.totalPriceWithCost.toFixed(2)} 元
            `;
        } else {
            const taxFactor = data.taxRate / 100;
            
            return `
                当期刨花价格 = ${data.basePrice} 元/吨<br>
                钼含量 = ${data.moContent}%<br>
                税率 = ${data.taxRate}%<br>
                费用 = ${data.cost} 元/吨<br>
                重量 = ${data.weight} 吨<br><br>
                钼含量区间：${data.range}<br>
                钼含量加价 = ${data.moAddition} 元/吨<br><br>
                计算公式：成交价 = 基价 + 钼含量加价<br>
                含税价格 = ${data.basePrice} + ${data.moAddition} = ${data.unitPrice.toFixed(2)} 元/吨<br><br>
                不含税单价 = ${data.unitPrice.toFixed(2)} × (1 - ${data.taxRate}%) = ${data.unitPriceExclTax.toFixed(2)} 元/吨<br>
                费用后单价 = ${data.unitPriceExclTax.toFixed(2)} - ${data.cost} = ${data.unitPriceWithCost.toFixed(2)} 元/吨<br><br>
                含税总价 = ${data.unitPrice.toFixed(2)} × ${data.weight} = ${data.totalPrice.toFixed(2)} 元<br>
                不含税总价 = ${data.unitPriceExclTax.toFixed(2)} × ${data.weight} = ${data.totalPriceExclTax.toFixed(2)} 元<br>
                费用后总价 = ${data.unitPriceWithCost.toFixed(2)} × ${data.weight} = ${data.totalPriceWithCost.toFixed(2)} 元
            `;
        }
    }

    resetScrap() {
        document.getElementById('pt-scrap').value = '';
        document.getElementById('y-percent').value = '';
        document.getElementById('pm-scrap').value = '';
        document.getElementById('z-factor').value = '';
        document.getElementById('weight-scrap').value = '1';
        document.getElementById('tax-rate-scrap').value = '12.5';
        document.getElementById('cost-scrap').value = '0';
        document.getElementById('result-scrap').classList.add('hidden');
        document.getElementById('calculation-details-scrap-container').classList.add('hidden');
    }

    resetShavings() {
        document.getElementById('base-price').value = '';
        document.getElementById('mo-content').value = '';
        document.getElementById('weight-shavings').value = '1';
        document.getElementById('tax-rate-shavings').value = '12';
        document.getElementById('cost-shavings').value = '0';
        document.getElementById('result-shavings').classList.add('hidden');
        document.getElementById('calculation-details-shavings-container').classList.add('hidden');
    }

    toggleDetails(type) {
        const suffix = type === 'scrap' ? 'scrap' : 'shavings';
        const container = document.getElementById(`calculation-details-${suffix}-container`);
        const button = document.getElementById(`toggle-details-${suffix}`);
        const icon = button.querySelector('i');
        
        container.classList.toggle('hidden');
        if (container.classList.contains('hidden')) {
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        } else {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.calculatorApp = new CalculatorApp();
});