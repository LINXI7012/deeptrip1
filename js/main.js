// Main JavaScript file for DeepTrip

document.addEventListener('DOMContentLoaded', function() {
    // Page transition effect
    const navLinks = document.querySelectorAll('.nav-item');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            
            // Add transition effect
            document.body.classList.add('page-transition');
            
            // Navigate after transition
            setTimeout(() => {
                window.location.href = target;
            }, 600);
        });
    });
    
    // Back button functionality
    const backButton = document.querySelector('.back-nav');
    if (backButton) {
        backButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add transition effect
            document.body.classList.add('page-transition-reverse');
            
            // Navigate back after transition
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 600);
        });
    }
    
    // Add time-based background changes
    updateBackgroundBasedOnTime();
    
    // Check for page-specific initializations
    if (document.body.classList.contains('create-page')) {
        initCreatePage();
    } else if (document.body.classList.contains('explore-page')) {
        initExplorePage();
    } else if (document.body.classList.contains('personal-page')) {
        initPersonalPage();
    } else if (document.body.classList.contains('plans-page')) {
        initPlansPage();
    }
});

// Update background based on time of day
function updateBackgroundBasedOnTime() {
    const hour = new Date().getHours();
    const body = document.body;
    
    // Morning: 5am - 11am
    if (hour >= 5 && hour < 11) {
        body.classList.add('time-morning');
    } 
    // Afternoon: 11am - 5pm
    else if (hour >= 11 && hour < 17) {
        body.classList.add('time-afternoon');
    } 
    // Evening: 5pm - 9pm
    else if (hour >= 17 && hour < 21) {
        body.classList.add('time-evening');
    } 
    // Night: 9pm - 5am
    else {
        body.classList.add('time-night');
    }
}

// Create page functionality
function initCreatePage() {
    let currentQuestion = 1;
    const totalQuestions = 8;
    const answers = {};
    
    // Update progress indicator
    updateProgress(currentQuestion, totalQuestions);
    
    // Handle option selection
    const options = document.querySelectorAll('.question-option');
    options.forEach(option => {
        option.addEventListener('click', function() {
            // Store the answer
            const questionId = this.closest('.question').dataset.questionId;
            const optionValue = this.dataset.value;
            answers[questionId] = optionValue;
            
            // Visual feedback
            this.classList.add('selected');
            
            // Siblings fade out
            const siblings = Array.from(this.parentNode.children).filter(el => el !== this);
            siblings.forEach(sibling => {
                sibling.classList.add('faded');
            });
            
            // Move to next question after a short delay
            setTimeout(() => {
                if (currentQuestion < totalQuestions) {
                    currentQuestion++;
                    showQuestion(currentQuestion);
                    updateProgress(currentQuestion, totalQuestions);
                } else {
                    showResults(answers);
                }
            }, 800);
        });
    });
}

// Update progress bar
function updateProgress(current, total) {
    const progressBar = document.querySelector('.progress-bar-fill');
    if (progressBar) {
        const percentage = (current / total) * 100;
        progressBar.style.width = `${percentage}%`;
        
        // Update text indicator
        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = `${current}/${total}`;
        }
    }
}

// Show specific question
function showQuestion(questionNumber) {
    const questions = document.querySelectorAll('.question');
    questions.forEach(question => {
        question.classList.remove('active');
    });
    
    const targetQuestion = document.querySelector(`.question[data-question-id="${questionNumber}"]`);
    if (targetQuestion) {
        targetQuestion.classList.add('active');
    }
}

// Show results
function showResults(answers) {
    // Hide questions
    const questionContainer = document.querySelector('.question-container');
    if (questionContainer) {
        questionContainer.style.display = 'none';
    }
    
    // Show loading animation
    const loadingAnimation = document.querySelector('.loading-animation');
    if (loadingAnimation) {
        loadingAnimation.style.display = 'flex';
        
        // Simulate API call with timeout
        setTimeout(() => {
            loadingAnimation.style.display = 'none';
            
            // Show results container
            const resultsContainer = document.querySelector('.results-container');
            if (resultsContainer) {
                resultsContainer.style.display = 'block';
                // 调用异步函数生成旅行攻略
                generateTravelGuide(answers, resultsContainer)
                    .then(travelGuide => {
                        console.log('旅行攻略生成成功:', travelGuide.destination);
                    })
                    .catch(error => {
                        console.error('旅行攻略生成失败:', error);
                    });
            }
        }, 3000);
    }
}

// Generate travel guide based on answers
async function generateTravelGuide(answers, container) {
    // 显示加载中UI
    container.innerHTML = `
        <div class="generating-container">
            <h2>正在创建您的个性化旅行攻略...</h2>
            <div class="generating-loader">
                <div class="loader-dot"></div>
                <div class="loader-dot"></div>
                <div class="loader-dot"></div>
            </div>
        </div>
    `;
    
    try {
        // 将answers对象中的数据转换为更有意义的文本描述
        const userPreferences = {
            region: getTextForValue(1, answers[1]),
            geography: getTextForValue(2, answers[2]),
            climate: getTextForValue(3, answers[3]),
            citySize: getTextForValue(4, answers[4]),
            travelStyle: getTextForValue(5, answers[5]),
            duration: getTextForValue(6, answers[6]),
            budget: getTextForValue(7, answers[7]),
            companions: getTextForValue(8, answers[8])
        };
        
        // 构建DeepSeek API请求体
        const deepseekPrompt = `
            我需要你为一位旅行者生成一个详细的定制旅行攻略。请根据以下偏好生成:
            
            - 旅行地区: ${userPreferences.region}
            - 地理偏好: ${userPreferences.geography}
            - 气候偏好: ${userPreferences.climate}
            - 城市规模: ${userPreferences.citySize}
            - 旅行风格: ${userPreferences.travelStyle}
            - 旅行时长: ${userPreferences.duration}
            - 预算水平: ${userPreferences.budget}
            - 旅行同伴: ${userPreferences.companions}
            
            请生成以下格式的旅行攻略(用JSON格式回复):
            
            {
                "destination": "具体目的地名称和国家",
                "duration": "建议的旅行天数",
                "season": "最佳旅行季节",
                "highlights": ["至少4个必去景点/体验"],
                "dailyPlan": [
                    {"day": 1, "activity": "第一天活动描述", "location": "具体地点"},
                    // ...根据旅行天数生成适当数量的日计划
                ]
            }
            
            请确保:
            1. 你推荐的目的地符合用户的地区和地理偏好
            2. 活动和行程符合用户的旅行风格和预算
            3. 推荐的季节符合用户的气候偏好
            4. 行程天数与用户期望的旅行时长相符
            5. 建议的活动适合用户的同行人数和关系
            
            注意:请确保生成的攻略适合这个人的旅行偏好，并且仅返回上述JSON格式的内容，不要包含其他解释。
        `;
        
        // 调用DeepSeek API
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk-9d50a093256a4261907e6bc933857d98'
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: 'You are a travel planning assistant that creates personalized travel guides based on user preferences. Always respond with valid JSON format.' },
                    { role: 'user', content: deepseekPrompt }
                ],
                temperature: 0.7,
                stream: false
            })
        });
        
        // 处理API响应
        if (!response.ok) {
            throw new Error(`API请求失败: ${response.statusText}`);
        }
        
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        // 解析AI生成的JSON
        let travelGuide;
        try {
            // 提取JSON部分（API可能会返回额外文本）
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
            travelGuide = JSON.parse(jsonString);
        } catch (e) {
            console.error("无法解析AI响应为JSON:", e);
            // 使用备用数据以防解析失败
            travelGuide = getFallbackTravelGuide();
        }
        
        // 生成HTML用于显示结果
        let resultsHTML = `
            <h2 class="result-title">您的个性化旅行攻略</h2>
            <div class="result-destination">
                <h3>${travelGuide.destination}</h3>
                <p>${travelGuide.duration} in ${travelGuide.season}</p>
            </div>
            <div class="result-highlights">
                <h4>亮点景点</h4>
                <ul>
        `;
        
        travelGuide.highlights.forEach(highlight => {
            resultsHTML += `<li>${highlight}</li>`;
        });
        
        resultsHTML += `
                </ul>
            </div>
            <div class="result-daily-plan">
                <h4>每日计划</h4>
                <div class="daily-plan-container">
        `;
        
        travelGuide.dailyPlan.forEach(day => {
            resultsHTML += `
                <div class="day-card">
                    <div class="day-number">Day ${day.day}</div>
                    <div class="day-details">
                        <h5>${day.activity}</h5>
                        <p>${day.location}</p>
                    </div>
                </div>
            `;
        });
        
        resultsHTML += `
                </div>
            </div>
            <div class="result-actions">
                <button id="saveButton" class="btn btn-primary">保存攻略</button>
                <button class="btn btn-secondary">分享</button>
                <button class="btn btn-outline">重新开始</button>
            </div>
        `;
        
        // 插入内容到容器
        container.innerHTML = resultsHTML;
        
        // 添加保存按钮的事件监听
        const saveButton = document.getElementById('saveButton');
        if (saveButton) {
            saveButton.addEventListener('click', function() {
                // 保存旅行攻略数据到localStorage
                saveTravelGuide(travelGuide);
                
                // 创建成功消息覆盖层
                const overlay = document.createElement('div');
                overlay.className = 'success-message-overlay';
                
                const successMessage = document.createElement('div');
                successMessage.className = 'success-message';
                
                const icon = document.createElement('div');
                icon.className = 'success-icon';
                icon.innerHTML = '✓';
                
                const title = document.createElement('h3');
                title.textContent = '保存成功！';
                
                const message = document.createElement('p');
                message.textContent = '您的旅行攻略已保存，可以在"旅行计划"页面查看。';
                
                successMessage.appendChild(icon);
                successMessage.appendChild(title);
                successMessage.appendChild(message);
                overlay.appendChild(successMessage);
                
                document.body.appendChild(overlay);
                
                // 模拟保存到后端，然后重定向
                setTimeout(function() {
                    window.location.href = 'plans.html';
                }, 2000);
            });
        }
        
        // 返回生成的旅行攻略数据
        return travelGuide;
    } catch (error) {
        console.error("生成旅行攻略时出错:", error);
        // 显示错误信息并提供重试选项
        container.innerHTML = `
            <div class="error-container">
                <h2>生成攻略时出现问题</h2>
                <p>很抱歉，我们无法生成您的旅行攻略。请稍后再试。</p>
                <button id="retryButton" class="btn btn-primary">重试</button>
            </div>
        `;
        
        // 添加重试按钮事件监听器
        document.getElementById('retryButton').addEventListener('click', () => {
            generateTravelGuide(answers, container);
        });
        
        // 返回默认攻略数据
        return getFallbackTravelGuide();
    }
}

// 保存旅行攻略到localStorage
function saveTravelGuide(travelGuideData) {
    // 获取现有攻略或初始化空数组
    let savedGuides = JSON.parse(localStorage.getItem('savedGuides')) || [];
    
    // 添加新攻略，带有唯一ID和当前日期
    const newGuide = {
        id: Date.now(), // 使用时间戳作为唯一ID
        createdAt: new Date().toISOString(),
        ...travelGuideData
    };
    
    // 添加到数组开头（最新的优先）
    savedGuides.unshift(newGuide);
    
    // 保存回localStorage
    localStorage.setItem('savedGuides', JSON.stringify(savedGuides));
    
    console.log('旅行攻略已保存:', newGuide);
    return newGuide.id;
}

// 将选项值转换为文本描述
function getTextForValue(questionId, value) {
    const descriptions = {
        1: { // 旅行地点范围
            domestic: "国内",
            asia: "亚洲",
            europe: "欧洲",
            america: "美洲"
        },
        2: { // 地理特征
            beach: "海滩",
            mountain: "山脉",
            city: "城市",
            countryside: "乡村"
        },
        3: { // 气候类型
            tropical: "热带气候",
            temperate: "温带气候",
            cold: "寒冷气候",
            any: "不限气候"
        },
        4: { // 城市规模
            metropolis: "大都市",
            midsize: "中等城市",
            town: "小镇",
            rural: "乡村地区"
        },
        5: { // 旅行风格
            adventure: "冒险体验",
            cultural: "文化探索",
            relaxation: "放松休闲",
            foodie: "美食之旅"
        },
        6: { // 旅行时长
            weekend: "周末短途 (2-3天)",
            week: "一周左右 (5-7天)",
            twoweeks: "两周左右 (10-14天)",
            month: "长期旅行 (30天以上)"
        },
        7: { // 预算水平
            budget: "经济实惠",
            moderate: "中等预算",
            luxury: "豪华体验",
            unlimited: "不限预算"
        },
        8: { // 旅伴
            solo: "独自旅行",
            couple: "情侣出游",
            friends: "朋友结伴",
            family: "家庭旅行"
        }
    };
    
    return descriptions[questionId]?.[value] || "未指定";
}

// 获取备用旅行攻略数据
function getFallbackTravelGuide() {
    return {
        destination: "京都，日本",
        duration: "7天",
        season: "秋季",
        highlights: [
            "伏见稻荷大社",
            "岚山竹林",
            "金阁寺",
            "祗园区"
        ],
        dailyPlan: [
            { day: 1, activity: "抵达并安顿", location: "京都站" },
            { day: 2, activity: "寺庙之旅", location: "东京都" },
            { day: 3, activity: "文化探索", location: "祗园和市中心" },
            { day: 4, activity: "自然之日", location: "岚山" },
            { day: 5, activity: "历史探索", location: "北京都" },
            { day: 6, activity: "美食之旅", location: "锦市场及周边" },
            { day: 7, activity: "最终观光和离开", location: "南京都" }
        ]
    };
}

// Initialize Explore page with world map
function initExplorePage() {
    // Initialize map (this would normally use a mapping library like Mapbox or Leaflet)
    console.log('Explore page initialized');
    
    // Simulate destinations data
    const destinations = [
        { id: 1, name: 'Paris', lat: 48.8566, lng: 2.3522, region: 'Europe' },
        { id: 2, name: 'Tokyo', lat: 35.6762, lng: 139.6503, region: 'Asia' },
        { id: 3, name: 'New York', lat: 40.7128, lng: -74.0060, region: 'North America' },
        { id: 4, name: 'Sydney', lat: -33.8688, lng: 151.2093, region: 'Australia' },
        { id: 5, name: 'Cairo', lat: 30.0444, lng: 31.2357, region: 'Africa' },
        { id: 6, name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, region: 'South America' }
    ];
    
    // Simulate map point clicks
    const mapPoints = document.querySelectorAll('.map-point');
    if (mapPoints) {
        mapPoints.forEach(point => {
            point.addEventListener('click', function() {
                const destinationId = this.dataset.id;
                const destination = destinations.find(d => d.id == destinationId);
                
                if (destination) {
                    showDestinationDetails(destination);
                }
            });
            
            // Hover effect
            point.addEventListener('mouseenter', function() {
                this.classList.add('hover');
            });
            
            point.addEventListener('mouseleave', function() {
                this.classList.remove('hover');
            });
        });
    }
}

// Show destination details modal
function showDestinationDetails(destination) {
    const modal = document.querySelector('.destination-modal');
    if (modal) {
        const modalTitle = modal.querySelector('.modal-title');
        const modalContent = modal.querySelector('.modal-content');
        
        modalTitle.textContent = destination.name;
        
        // Simulate content fetching
        modalContent.innerHTML = `
            <div class="destination-image" style="background-image: url('images/${destination.name.toLowerCase()}.jpg')"></div>
            <div class="destination-info">
                <h4>About ${destination.name}</h4>
                <p>This is where detailed information about ${destination.name} would appear, including cultural highlights, best times to visit, and travel tips.</p>
                <div class="destination-facts">
                    <div class="fact">
                        <span class="fact-label">Region</span>
                        <span class="fact-value">${destination.region}</span>
                    </div>
                    <div class="fact">
                        <span class="fact-label">Language</span>
                        <span class="fact-value">Various</span>
                    </div>
                    <div class="fact">
                        <span class="fact-label">Currency</span>
                        <span class="fact-value">Various</span>
                    </div>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
    }
}

// Initialize Personal page
function initPersonalPage() {
    console.log('Personal page initialized');
    
    // Simulate past travels data
    const pastTravels = [
        { date: '2023-05', destination: 'Barcelona', highlight: 'Sagrada Familia' },
        { date: '2022-09', destination: 'Rome', highlight: 'Colosseum' },
        { date: '2022-01', destination: 'Bali', highlight: 'Rice Terraces' }
    ];
    
    // Populate timeline
    const timeline = document.querySelector('.timeline');
    if (timeline && pastTravels.length > 0) {
        let timelineHTML = '';
        
        pastTravels.forEach(travel => {
            const date = new Date(travel.date);
            const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            
            timelineHTML += `
                <div class="timeline-item">
                    <div class="timeline-date">${formattedDate}</div>
                    <div class="timeline-content">
                        <h4>${travel.destination}</h4>
                        <p>Highlight: ${travel.highlight}</p>
                    </div>
                </div>
            `;
        });
        
        timeline.innerHTML = timelineHTML;
    }
}

// Initialize Plans page
function initPlansPage() {
    console.log('Plans page initialized');
    
    // Get saved travel guides from localStorage
    const savedGuides = JSON.parse(localStorage.getItem('savedGuides')) || [];
    
    // Initialize upcomingPlans array
    let upcomingPlans = [];
    
    // First add saved guides to plans with default tasks
    savedGuides.forEach(guide => {
        // Extract destination and create start/end dates
        const destination = guide.destination.split(',')[0]; // Just take the city part
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + 30); // Set departure to 30 days from now
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + parseInt(guide.duration)); // Add duration
        
        // Create plan object
        upcomingPlans.push({
            id: guide.id,
            destination: destination,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            tasks: [
                { id: guide.id + 1, text: 'Book flight', completed: false },
                { id: guide.id + 2, text: 'Reserve accommodation', completed: false },
                { id: guide.id + 3, text: 'Plan daily activities', completed: true },
                { id: guide.id + 4, text: 'Pack luggage', completed: false }
            ],
            // Store the full guide data for viewing details
            guideData: guide
        });
    });
    
    // Then add simulated upcoming plans data
    upcomingPlans = upcomingPlans.concat([
        { 
            id: 1,
            destination: 'Kyoto', 
            startDate: '2024-11-10', 
            endDate: '2024-11-17',
            tasks: [
                { id: 101, text: 'Book flight', completed: true },
                { id: 102, text: 'Reserve hotel', completed: true },
                { id: 103, text: 'Research temples', completed: false },
                { id: 104, text: 'Pack luggage', completed: false }
            ]
        },
        { 
            id: 2,
            destination: 'Iceland', 
            startDate: '2025-02-15', 
            endDate: '2025-02-22',
            tasks: [
                { id: 201, text: 'Book northern lights tour', completed: true },
                { id: 202, text: 'Rent car', completed: false },
                { id: 203, text: 'Pack winter clothes', completed: false }
            ]
        }
    ]);
    
    // Populate plans
    const plansContainer = document.querySelector('.plans-container');
    if (plansContainer && upcomingPlans.length > 0) {
        let plansHTML = '';
        
        upcomingPlans.forEach(plan => {
            const startDate = new Date(plan.startDate);
            const endDate = new Date(plan.endDate);
            const formattedStartDate = startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            const formattedEndDate = endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            
            // Calculate completion percentage
            const totalTasks = plan.tasks.length;
            const completedTasks = plan.tasks.filter(task => task.completed).length;
            const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            
            // Add a badge for guides that came from the creator
            const hasGuideData = plan.guideData ? '<span class="plan-badge">New</span>' : '';
            
            plansHTML += `
                <div class="plan-card" data-plan-id="${plan.id}">
                    <div class="plan-header">
                        <h3>${plan.destination} ${hasGuideData}</h3>
                        <div class="plan-dates">${formattedStartDate} - ${formattedEndDate}</div>
                    </div>
                    <div class="plan-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${completionPercentage}%"></div>
                        </div>
                        <div class="progress-text">${completionPercentage}% ready</div>
                    </div>
                    <div class="plan-tasks">
                        <h4>Preparation tasks</h4>
                        <ul class="task-list">
            `;
            
            plan.tasks.forEach(task => {
                plansHTML += `
                    <li class="task-item ${task.completed ? 'completed' : ''}">
                        <label class="task-checkbox">
                            <input type="checkbox" ${task.completed ? 'checked' : ''} data-task-id="${task.id}">
                            <span class="checkmark"></span>
                        </label>
                        <span class="task-text">${task.text}</span>
                    </li>
                `;
            });
            
            plansHTML += `
                        </ul>
                    </div>
                    <div class="plan-actions">
                        <button class="btn btn-small btn-outline">Edit</button>
                        <button class="btn btn-small btn-highlight view-plan" data-plan-id="${plan.id}">View</button>
                    </div>
                </div>
            `;
        });
        
        plansContainer.innerHTML = plansHTML;
        
        // Add event listeners to checkboxes
        const checkboxes = document.querySelectorAll('.task-checkbox input');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const taskId = this.dataset.taskId;
                const planId = this.closest('.plan-card').dataset.planId;
                
                // Update task status (would normally be an API call)
                console.log(`Task ${taskId} in plan ${planId} set to ${this.checked}`);
                
                // Update UI
                if (this.checked) {
                    this.closest('.task-item').classList.add('completed');
                } else {
                    this.closest('.task-item').classList.remove('completed');
                }
                
                // Recalculate progress
                updatePlanProgress(planId);
            });
        });
        
        // Add event listeners to view buttons
        const viewButtons = document.querySelectorAll('.view-plan');
        viewButtons.forEach(button => {
            button.addEventListener('click', function() {
                const planId = this.dataset.planId;
                const plan = upcomingPlans.find(p => p.id == planId);
                
                if (plan && plan.guideData) {
                    // Show travel guide details
                    showTravelGuideDetails(plan.guideData);
                } else {
                    // Show regular trip details
                    showTripDetails(plan);
                }
            });
        });
        
        // Add event listeners to edit buttons
        const editButtons = document.querySelectorAll('.btn-small.btn-outline');
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const planId = this.closest('.plan-card').dataset.planId;
                const plan = upcomingPlans.find(p => p.id == planId);
                
                if (plan) {
                    showEditGuideModal(plan);
                }
            });
        });
        
        // Add event listener to close travel guide modal
        const closeButton = document.querySelector('.travel-guide-close');
        if (closeButton) {
            closeButton.addEventListener('click', closeTravelGuideModal);
        }
        
        // Close modal when clicking overlay
        const overlay = document.querySelector('.travel-guide-overlay');
        if (overlay) {
            overlay.addEventListener('click', closeTravelGuideModal);
        }
    }
}

// Show travel guide details in modal
function showTravelGuideDetails(guideData) {
    const modal = document.querySelector('.travel-guide-modal');
    const overlay = document.querySelector('.travel-guide-overlay');
    const container = document.querySelector('.travel-guide-container');
    const title = document.querySelector('.travel-guide-title');
    
    if (modal && container) {
        // Set title
        title.textContent = `Travel Guide: ${guideData.destination}`;
        
        // Generate HTML for the travel guide
        let guideHTML = `
            <div class="guide-destination">
                <h3>${guideData.destination}</h3>
                <p>${guideData.duration} in ${guideData.season}</p>
            </div>
            <div class="guide-highlights">
                <h4>Highlights</h4>
                <ul>
        `;
        
        guideData.highlights.forEach(highlight => {
            guideHTML += `<li>${highlight}</li>`;
        });
        
        guideHTML += `
                </ul>
            </div>
            <div class="guide-daily-plan">
                <h4>Daily Plan</h4>
                <div class="guide-daily-plan-container">
        `;
        
        guideData.dailyPlan.forEach(day => {
            guideHTML += `
                <div class="guide-day-card">
                    <div class="guide-day-number">Day ${day.day}</div>
                    <div class="guide-day-details">
                        <h5>${day.activity}</h5>
                        <p>${day.location}</p>
                    </div>
                </div>
            `;
        });
        
        guideHTML += `
                </div>
            </div>
        `;
        
        // Insert content
        container.innerHTML = guideHTML;
        
        // Show modal and overlay
        modal.classList.add('active');
        overlay.classList.add('active');
    }
}

// Close travel guide modal
function closeTravelGuideModal() {
    const modal = document.querySelector('.travel-guide-modal');
    const overlay = document.querySelector('.travel-guide-overlay');
    
    if (modal && overlay) {
        modal.classList.remove('active');
        overlay.classList.remove('active');
    }
}

// Show regular trip details
function showTripDetails(plan) {
    // This would normally show the existing trip details modal
    console.log('Show trip details for', plan.destination);
    
    // For now, just show an alert
    alert(`Trip details for ${plan.destination} will be shown here`);
}

// Update plan progress display
function updatePlanProgress(planId) {
    const planCard = document.querySelector(`.plan-card[data-plan-id="${planId}"]`);
    if (planCard) {
        const taskItems = planCard.querySelectorAll('.task-item');
        const totalTasks = taskItems.length;
        const completedTasks = planCard.querySelectorAll('.task-item.completed').length;
        
        const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        const progressFill = planCard.querySelector('.progress-fill');
        const progressText = planCard.querySelector('.progress-text');
        
        if (progressFill && progressText) {
            progressFill.style.width = `${completionPercentage}%`;
            progressText.textContent = `${completionPercentage}% ready`;
        }
    }
}

/**
 * 显示编辑攻略模态窗口
 * @param {Object} plan - 旅行计划对象
 */
function showEditGuideModal(plan) {
    const modal = document.querySelector('.edit-guide-modal');
    const overlay = document.querySelector('.edit-guide-overlay');
    
    modal.setAttribute('data-plan-id', plan.id);

    // Show the first section and hide others
    document.querySelector('.edit-section').style.display = 'block';
    document.querySelector('.day-edit-section').style.display = 'none';
    document.querySelector('.day-edit-form').style.display = 'none';
    document.querySelector('.delete-confirm-section').style.display = 'none';

    // Add event listeners
    document.querySelector('.edit-guide-close').addEventListener('click', closeEditModal);
    document.getElementById('deleteGuideBtn').addEventListener('click', () => showDeleteConfirmation(plan));
    document.getElementById('modifyItineraryBtn').addEventListener('click', () => showDaySelection(plan));
    document.getElementById('backToEditBtn').addEventListener('click', () => {
        document.querySelector('.edit-section').style.display = 'block';
        document.querySelector('.day-edit-section').style.display = 'none';
    });
    document.getElementById('backToDaysBtn').addEventListener('click', () => {
        document.querySelector('.day-edit-section').style.display = 'block';
        document.querySelector('.day-edit-form').style.display = 'none';
    });
    document.getElementById('saveDayBtn').addEventListener('click', function() {
        const planId = modal.getAttribute('data-plan-id');
        const dayIndex = document.querySelector('.day-edit-form').getAttribute('data-day-index');
        const activity = document.getElementById('dayActivityInput').value;
        const location = document.getElementById('dayLocationInput').value;
        saveDayEdit(planId, dayIndex, activity, location);
    });

    // Add event listeners for delete confirmation
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
        document.querySelector('.edit-section').style.display = 'block';
        document.querySelector('.delete-confirm-section').style.display = 'none';
    });
    document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
        const planId = modal.getAttribute('data-plan-id');
        deleteGuide(planId);
    });

    // Add click event to overlay to close modal
    overlay.addEventListener('click', closeEditModal);

    // Show modal and overlay
    modal.classList.add('active');
    overlay.classList.add('active');
}

/**
 * 显示日期选择部分
 * @param {Object} plan - 旅行计划对象
 */
function showDaySelection(plan) {
    // Hide edit section, show day selection section
    document.querySelector('.edit-section').style.display = 'none';
    document.querySelector('.day-edit-section').style.display = 'block';
    
    // Get day selection container
    const daySelectContainer = document.querySelector('.day-select-container');
    if (!daySelectContainer) return;
    
    // Clear container
    daySelectContainer.innerHTML = '';
    
    // Get the correct daily plan array (either from guideData or directly)
    const dailyPlan = plan.guideData ? plan.guideData.dailyPlan : plan.dailyPlan;
    
    // Check if we have daily plan data
    if (!dailyPlan || !dailyPlan.length) {
        daySelectContainer.innerHTML = '<p>No itinerary data available for this plan.</p>';
        return;
    }
    
    // Fill with day selection buttons
    dailyPlan.forEach((day, index) => {
        const dayBtn = document.createElement('div');
        dayBtn.className = 'day-select-btn';
        dayBtn.textContent = `Day ${day.day || (index + 1)}`;
        dayBtn.setAttribute('data-day-index', index);
        
        dayBtn.onclick = function() {
            const dayIndex = this.getAttribute('data-day-index');
            showDayEditForm(plan, parseInt(dayIndex));
        };
        
        daySelectContainer.appendChild(dayBtn);
    });
}

/**
 * 显示日程编辑表单
 * @param {Object} plan - 旅行计划对象
 * @param {Number} dayIndex - 日期索引
 */
function showDayEditForm(plan, dayIndex) {
    document.querySelector('.day-edit-section').style.display = 'none';
    document.querySelector('.day-edit-form').style.display = 'block';
    
    // Set day index attribute
    document.querySelector('.day-edit-form').setAttribute('data-day-index', dayIndex);
    
    // Get the correct daily plan array (either from guideData or directly)
    const dailyPlan = plan.guideData ? plan.guideData.dailyPlan : plan.dailyPlan;
    
    // Pre-fill form with existing data
    const day = dailyPlan[dayIndex];
    document.getElementById('dayActivityInput').value = day.activity;
    document.getElementById('dayLocationInput').value = day.location;
}

/**
 * 保存日程编辑
 * @param {String} planId - 计划ID
 * @param {Number} dayIndex - 日期索引
 * @param {String} activity - 活动内容
 * @param {String} location - 地点
 */
function saveDayEdit(planId, dayIndex, activity, location) {
    // Get saved guides
    let savedGuides = JSON.parse(localStorage.getItem('savedGuides') || '[]');
    
    // Find the guide to edit
    const guideIndex = savedGuides.findIndex(guide => guide.id == planId);
    
    if (guideIndex !== -1) {
        // Update the day's data
        savedGuides[guideIndex].dailyPlan[dayIndex].activity = activity;
        savedGuides[guideIndex].dailyPlan[dayIndex].location = location;
        
        // Save updated guides
        localStorage.setItem('savedGuides', JSON.stringify(savedGuides));
        
        // Show success message
        showMessage('行程已成功更新');
        
        // Close modal and refresh plans display
        closeEditModal();
        initPlansPage();
    }
}

/**
 * 显示删除确认部分
 * @param {Object} plan - 旅行计划对象
 */
function showDeleteConfirmation(plan) {
    document.querySelector('.edit-section').style.display = 'none';
    document.querySelector('.delete-confirm-section').style.display = 'block';
}

/**
 * 删除旅行攻略
 * @param {String} planId - 计划ID
 */
function deleteGuide(planId) {
    // Get saved guides
    let savedGuides = JSON.parse(localStorage.getItem('savedGuides') || '[]');
    
    // Convert planId to a number if it's stored as a string
    const numericPlanId = Number(planId);
    
    // Find and remove the guide
    const guideIndex = savedGuides.findIndex(guide => Number(guide.id) === numericPlanId);
    if (guideIndex !== -1) {
        savedGuides.splice(guideIndex, 1);
        
        // Save updated guides
        localStorage.setItem('savedGuides', JSON.stringify(savedGuides));
        
        // Show success message
        showMessage('攻略已成功删除');
        
        // Close modal and refresh plans display
        closeEditModal();
        initPlansPage();
    } else {
        console.error('未找到ID为', planId, '的攻略');
        showMessage('删除失败：未找到攻略');
    }
}

/**
 * 关闭编辑攻略模态窗口
 */
function closeEditModal() {
    const modal = document.querySelector('.edit-guide-modal');
    const overlay = document.querySelector('.edit-guide-overlay');
    
    if (modal) {
        modal.classList.remove('active');
    }
    
    if (overlay) {
        overlay.classList.remove('active');
    }
}

/**
 * 显示消息
 * @param {String} message - 消息内容
 */
function showMessage(message) {
    // 创建消息元素
    const messageEl = document.createElement('div');
    messageEl.className = 'message-overlay';
    messageEl.innerHTML = `
        <div class="message-box">
            <div class="message-content">${message}</div>
        </div>
    `;
    
    // 添加到文档中
    document.body.appendChild(messageEl);
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .message-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }
        .message-box {
            background: var(--main-color);
            border-radius: 10px;
            padding: 20px 30px;
            text-align: center;
            animation: fadeIn 0.3s ease;
        }
        .message-content {
            font-size: 1.2rem;
            color: var(--text-light);
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
    
    // 3秒后移除消息
    setTimeout(() => {
        messageEl.remove();
        style.remove();
    }, 3000);
} 