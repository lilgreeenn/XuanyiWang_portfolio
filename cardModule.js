export function createCard(data) {
    // 实现创建卡片的逻辑
}

export function updateCardPositions(cards, currentIndex, totalCards, visibleCards) {
    // 实现更新卡片位置的逻辑
}

export function handleScroll(event, cards, currentIndex, totalCards, visibleCards) {
    // 实现滚动处理的逻辑
}

// 添加双击事件处理
let lastClickTime = 0;
const DOUBLE_CLICK_DELAY = 300;

export async function handleCardClick(event) {
    const card = event.target.closest('.card');
    if (!card) return;
    
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastClickTime;
    
    if (timeDiff < DOUBLE_CLICK_DELAY) {
        // 双击 - 加载详细信息
        event.preventDefault();
        event.stopPropagation();
        console.log('Double click detected on card:', card);
        try {
            await loadProjectDetails(card);
        } catch (error) {
            console.error('Error loading project details:', error);
        }
    } else {
        // 单击 - 原有的卡片动画效果
        handleSingleClick(card);
    }
    
    lastClickTime = currentTime;
}

// 分离单击处理逻辑
function handleSingleClick(card) {
    if (card.classList.contains('active')) return;
    
    const container = card.parentElement;
    const cards = Array.from(container.children);
    const clickedIndex = cards.indexOf(card);
    
    // 计算中心位置
    const containerWidth = container.offsetWidth;
    const cardWidth = 300;
    const centerPosition = (containerWidth - cardWidth) / 2;

    // 移除其他卡片的active状态
    cards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');

    // 一次性设置所有卡片的状态
    requestAnimationFrame(() => {
        cards.forEach((c, index) => {
            if (c === card) {
                // 点击的卡片移到中间并放大
                c.style.transform = `
          translateX(${centerPosition}px)
          scale(1.2)
          rotate(0deg)
        `;
                c.style.zIndex = 1000;
            } else {
                // 其他卡片向两侧分散
                const isLeft = index < clickedIndex;
                const distance = Math.abs(clickedIndex - index);
                const offset = isLeft ? -distance * 60 : distance * 60;

                c.style.transform = `
          translateX(${centerPosition + offset}px)
          scale(0.8)
          rotate(${isLeft ? -5 : 5}deg)
        `;
                c.style.zIndex = 100 - distance;
            }
        });
    });

    // 显示详情
    showProjectDetails(card);
}

// 添加加载详细信息的函数
async function loadProjectDetails(card) {
    try {
        const title = card.querySelector('h3').textContent.trim();
        console.log('Looking for project with title:', title);

        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Loaded JSON data:', data);
        
        const project = data.projects.find(p => p.title.trim() === title);
        console.log('Found project:', project);
        
        if (project) {
            const projectDetails = document.getElementById('project-details');
            projectDetails.classList.add('active');
            document.body.style.overflow = 'hidden';
            updateProjectDetailsUI(project);
        } else {
            console.log('Project not found in data.json');
            showDefaultProjectDetails(card);
        }
    } catch (error) {
        console.error('Error loading project details:', error);
        showDefaultProjectDetails(card);
    }
}

// 将 updateProjectDetailsUI 改名为 showProjectDetails 并导出
export function showProjectDetails(card) {
    loadProjectDetails(card).catch(error => {
        console.error('加载项目详情失败:', error);
        // 显示默认信息
        showDefaultProjectDetails(card);
    });
}

// 添加默认项目详情显示函数
function showDefaultProjectDetails(card) {
    const title = card.querySelector('h3').textContent;
    const imageSrc = card.querySelector('img').src;
    const category = card.dataset.category;
    const tags = card.querySelector('.card-info p:last-child').textContent;
    
    // 显示基本信息
    document.getElementById('project-title').textContent = title;
    document.getElementById('project-image').src = imageSrc;
    document.getElementById('project-category').textContent = category;
    document.getElementById('project-tags').textContent = tags;
    document.getElementById('project-description').textContent = "Loading project details...";
    document.getElementById('project-tech').textContent = "Loading tech stack...";
    document.getElementById('project-date').textContent = "Loading date...";
    document.getElementById('project-link').href = "#";

    // 显示详情面板
    const projectDetails = document.getElementById('project-details');
    projectDetails.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 修改原来的 updateProjectDetailsUI 函数为内部函数
function updateProjectDetailsUI(project) {
    try {
        console.log('Updating UI with project:', project);
        
        // 更新基本信息
        document.getElementById('project-title').textContent = project.title;
        document.getElementById('project-category').textContent = `Category: ${project.category}`;
        document.getElementById('project-tags').textContent = `Tags: ${project.tags.join(', ')}`;
        document.getElementById('project-image').src = project.image;
        
        // 更新详细描述
        const descriptionHTML = `
            <p>${project.description}</p>
            ${project.fullDescription ? `
                <div class="full-description">
                    <h3>Challenge</h3>
                    <p>${project.fullDescription.challenge}</p>
                    <h3>Solution</h3>
                    <p>${project.fullDescription.solution}</p>
                    <h3>Impact</h3>
                    <p>${project.fullDescription.impact}</p>
                </div>
            ` : ''}
        `;
        document.getElementById('project-description').innerHTML = descriptionHTML;
        
        // 更新技术栈和日期
        document.getElementById('project-tech').textContent = project.tech || 'N/A';
        document.getElementById('project-date').textContent = project.date || 'N/A';
        
        // 更新画廊（如果存在）
        const galleryContainer = document.querySelector('.project-gallery');
        if (project.gallery && project.gallery.length > 0) {
            galleryContainer.innerHTML = project.gallery.map(img => 
                `<img src="${img}" alt="${project.title}">`
            ).join('');
            galleryContainer.style.display = 'grid';
        } else {
            galleryContainer.style.display = 'none';
        }
        
        // 更新功能列表（如果存在）
        const featuresContainer = document.querySelector('.project-features');
        if (project.features && project.features.length > 0) {
            featuresContainer.innerHTML = `
                <h3>Key Features</h3>
                <ul>
                    ${project.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            `;
            featuresContainer.style.display = 'block';
        } else {
            featuresContainer.style.display = 'none';
        }
        
        // 更新团队信息（如果存在）
        const teamContainer = document.querySelector('.team-info');
        if (project.team) {
            teamContainer.innerHTML = `
                <h3>Team Information</h3>
                <p>Team Size: ${project.team.size}</p>
                <p>Role: ${project.team.role}</p>
                <p>Duration: ${project.team.duration}</p>
            `;
            teamContainer.style.display = 'block';
        } else {
            teamContainer.style.display = 'none';
        }
        
        // 更新链接按钮
        const projectLink = document.getElementById('project-link');
        projectLink.innerHTML = ''; // 清空原有内容
        
        // 创建视频/主要链接
        if (project.link) {
            const mainLink = document.createElement('a');
            mainLink.href = project.link;
            mainLink.target = '_blank';
            mainLink.className = 'project-link-btn';
            
            if (project.link.includes('youtube.com')) {
                mainLink.textContent = 'Watch Video';
                mainLink.className += ' video-link';
            } else if (project.link.includes('drive.google.com')) {
                mainLink.textContent = 'View on Drive';
                mainLink.className += ' drive-link';
            } else {
                mainLink.textContent = 'View Project';
            }
            projectLink.appendChild(mainLink);
        }
        
        // 创建演示链接
        if (project.demoLink) {
            const demoLink = document.createElement('a');
            demoLink.href = project.demoLink;
            demoLink.target = '_blank';
            demoLink.className = 'project-link-btn demo-link';
            demoLink.textContent = 'Visit Website';
            projectLink.appendChild(demoLink);
        }
        
        // 显示链接容器
        projectLink.style.display = (project.link || project.demoLink) ? 'flex' : 'none';
        
    } catch (error) {
        console.error('Error updating UI:', error);
    }
}

export function hideProjectDetails() {
    const projectDetails = document.getElementById('project-details');
    projectDetails.classList.remove('active');
    document.body.style.overflow = 'auto';
}

export function filterCards(category) {
    const gallery = document.querySelector('.gallery');
    if (!gallery) return;
    
    const cards = gallery.querySelectorAll('.card');
    if (!cards || cards.length === 0) return;

    const cardsArray = Array.from(cards);
    
    cardsArray.forEach(card => {
        if (category === 'all') {
            card.style.display = 'block';
        } else {
            const cardCategory = card.dataset.category;
            card.style.display = cardCategory === category ? 'block' : 'none';
        }
    });
}

// 修改自动滚动函数
function startAutoScroll(cards, containerWidth, cardWidth, spacing, startX, totalCards) {
    if (window.autoScrollInterval) {
        clearInterval(window.autoScrollInterval);
    }

    window.autoScrollInterval = setInterval(() => {
        cards.forEach(card => {
            const currentPosition = parseInt(card.dataset.position);
            
            // 计算新位置
            let newPosition = (currentPosition + 1) % totalCards;
            card.dataset.position = newPosition;

            // 计算新的 X 坐标
            const x = startX + (newPosition * (cardWidth + spacing));
            
            // 应用新位置
            card.style.transform = `
                translate(${x}px, ${card.style.transform.split(',')[1]})
                scale(0.8)
                rotate(${newPosition % 2 === 0 ? 5 : -5}deg)
            `;
        });
    }, 3000);
}

// 在组件卸载或切换分类时清除定时器
function clearAutoScroll() {
    if (window.autoScrollInterval) {
        clearInterval(window.autoScrollInterval);
    }
}

// 修改事件监听器的添加方式
function initializeCategories() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const gallery = document.querySelector('.gallery');

    if (!gallery || !categoryButtons.length) return;

    // 初始化时显示所有卡片
    filterCards('all', gallery.children);

    // 添加卡片点击事件监听
    const cards = gallery.querySelectorAll('.card');
    cards.forEach(card => {
        // 移除旧的事件监听器
        card.removeEventListener('click', handleCardClick);
        // 添加新的事件监听器
        card.addEventListener('click', handleCardClick);
        
        // 添加悬浮事件
        card.addEventListener('mouseenter', handleCardHover);
        card.addEventListener('mouseleave', handleCardLeave);
        
        // 添加3D效果的事件监听
        card.addEventListener('mousemove', handleCardMouseMove);
        card.addEventListener('mouseleave', handleCardMouseLeave);
    });

    // 添加分类按钮事件监听
    categoryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const category = button.dataset.category;
            clearAutoScroll(); // 清除之前的滚动
            filterCards(category, gallery.children);
        });
    });

    // 初始化项目详情
    initializeProjectDetails();
}

// 确保DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCategories);
} else {
    initializeCategories();
}

export function playSound() {
    // 实现播放声音的逻辑
}

// 添加防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 修改handleCardHover函数
function handleCardHover(event) {
    const card = event.target.closest('.card');
    if (!card || card.classList.contains('active')) return;

    // 将所有卡片的z-index降低，包括中间的卡片
    const allCards = Array.from(card.parentElement.children);
    allCards.forEach(c => {
        // 如果是激活状态的卡片（中间的卡片），也降低其z-index
        if (c !== card) {
            if (c.classList.contains('active')) {
                c.style.zIndex = '500'; // 给中间卡片一个中等层级
            } else {
                c.style.zIndex = '1';
            }
        }
    });

    // 将当前悬浮的卡片设置最高层级
    card.style.zIndex = '99999'; // 使用更高的z-index确���在最上层

    const currentTransform = card.style.transform || '';
    if (currentTransform.includes('scale')) {
        card.style.transform = currentTransform.replace(/scale\([^)]*\)/, 'scale(1.05)');
    } else {
        const baseTransform = currentTransform || `
            translateX(${card.offsetLeft}px)
            scale(0.8)
            rotate(${card.dataset.rotation || '0'}deg)
        `;
        card.style.transform = baseTransform.replace(/scale\([^)]*\)/, 'scale(1.05)');
    }
}

// 修改handleCardLeave函数
function handleCardLeave(event) {
    const card = event.target.closest('.card');
    if (!card || card.classList.contains('active')) return;

    // 恢复来的z-index
    card.style.zIndex = card.dataset.originalZIndex || '1';

    // 恢复中间卡片的z-index为1000
    const allCards = Array.from(card.parentElement.children);
    allCards.forEach(c => {
        if (c.classList.contains('active')) {
            c.style.zIndex = '1000';
        }
    });

    const currentTransform = card.style.transform || '';
    if (currentTransform.includes('scale')) {
        card.style.transform = currentTransform.replace(/scale\([^)]*\)/, 'scale(0.8)');
    }
}

// 在初始化时添加关闭按钮事件监听
function initializeProjectDetails() {
    const closeButton = document.getElementById('close-details');
    if (closeButton) {
        closeButton.addEventListener('click', hideProjectDetails);
    }
    
    // 添加点击背景关闭的功能
    const projectDetails = document.getElementById('project-details');
    if (projectDetails) {
        projectDetails.addEventListener('click', (e) => {
            // 确保不是点击链接或其他内容区域
            if (e.target === projectDetails) {
                hideProjectDetails();
            }
        });
    }

    // 防止内容区域的点击事件冒泡
    const projectContent = document.querySelector('.project-content');
    if (projectContent) {
        projectContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

// 添加鼠标移动事件处理
function handleCardMouseMove(event) {
    const card = event.target.closest('.card');
    if (!card || card.classList.contains('active')) return;

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // 计算鼠标位置相对于卡片中心的偏移
    const deltaX = (mouseX - centerX) / (rect.width / 2);
    const deltaY = (mouseY - centerY) / (rect.height / 2);

    // 限制旋���角度在 -15 到 15 度之间
    const rotateX = deltaY * -15;
    const rotateY = deltaX * 15;

    // 添加hover-effect类以减少transition延迟
    card.classList.add('hover-effect');

    // 应用3D变换
    const currentTransform = card.style.transform;
    const baseTransform = currentTransform.split(' rotate')[0]; // 保留基础变换
    card.style.transform = `
        ${baseTransform}
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(0.8)
    `;
}

// 添加鼠标离开事件处理
function handleCardMouseLeave(event) {
    const card = event.target.closest('.card');
    if (!card || card.classList.contains('active')) return;

    // 移除hover-effect类恢复正常transition
    card.classList.remove('hover-effect');

    // 重置变换
    const currentTransform = card.style.transform;
    const baseTransform = currentTransform.split(' rotate')[0];
    card.style.transform = `
        ${baseTransform}
        rotateX(0deg)
        rotateY(0deg)
        scale(0.8)
    `;
}


