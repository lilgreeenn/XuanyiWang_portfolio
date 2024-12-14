import {
    handleCardClick,
    showProjectDetails,
    hideProjectDetails,
    filterCards,
    playSound
} from './cardModule.js';

const gallery = document.querySelector('.gallery');
let cards = document.querySelectorAll('.card');
const categoryButtons = document.querySelectorAll('.category-btn');
const projectDetails = document.getElementById('project-details');
const projectTitle = document.getElementById('project-title');
const projectImage = document.getElementById('project-image');
const projectDescription = document.getElementById('project-description');
const closeDetails = document.getElementById('close-details');

let currentIndex = 0;
let totalCards = cards.length;
const visibleCards = 15;

// 添加一个节流变量
let isScrolling = false;
let scrollTimeout = null;

const layoutToggle = document.getElementById('layout-toggle');
let isMasonryLayout = false;

layoutToggle.addEventListener('click', () => {
    const gallery = document.querySelector('.gallery');
    isMasonryLayout = !isMasonryLayout;
    
    if (isMasonryLayout) {
        gallery.classList.add('masonry');
        gallery.removeEventListener('wheel', handleScroll);
        document.removeEventListener('mousemove', handleMouseMove);
    } else {
        gallery.classList.remove('masonry');
        gallery.addEventListener('wheel', handleScroll, { passive: false });
        document.addEventListener('mousemove', handleMouseMove);
        
        // 重新初始化卡片位置
        updateCardPositions();
    }
});

// 瀑布流布局的无限滚动
function handleMasonryScroll() {
    if (!isMasonryLayout) return;
    
    const gallery = document.querySelector('.gallery');
    if (window.innerHeight + window.scrollY >= gallery.offsetHeight - 100) {
        loadMorePhotos();
    }
}

window.addEventListener('scroll', handleMasonryScroll);

function updateCardPositions() {
    cards.forEach((card, index) => {
        const offset = index - currentIndex;
        const translateX = offset * 150;
        const translateY = offset * 75;
        const translateZ = -Math.abs(offset) * 200;

        // 基础位置和缩放
        const transform = `
            translateX(${translateX}px)
            translateY(${translateY}px)
            translateZ(${translateZ}px)
            scale(${Math.abs(offset) === 0 ? 1.2 : 0.8})
        `;

        card.style.transform = transform;
        card.style.zIndex = Math.abs(offset) === 0 ? 1000 : (totalCards - Math.abs(offset));

        // 只在滚动时更新active状态
        if (Math.abs(offset) === 0) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

function handleScroll(event) {
    event.preventDefault();
    
    // 如果正在滚动中，则返回
    if (isScrolling) return;
    
    // 设置滚动标志
    isScrolling = true;
    
    const delta = Math.sign(event.deltaY);
    currentIndex = (currentIndex + delta + totalCards) % totalCards;

    // 更新卡片位置
    updateCardPositions();

    // 检查是否需要加载更多卡片
    if (currentIndex > totalCards - visibleCards - 5) {
        loadMorePhotos();
    }

    // 300毫秒后才能进行下一次滚动
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
    }, 100); // 可以调整这个值来改变滚动的灵敏度，值越大滚动越不灵敏
}

function handleCardHover(event) {
    const card = event.target.closest('.card');
    if (!card || card.classList.contains('active')) return;

    // 只添加hover类，不改变位置
    card.classList.add('hover');

    // 阻止事件冒泡，避免触发其他效果
    event.stopPropagation();
}

function handleCardLeave(event) {
    const card = event.target.closest('.card');
    if (!card || card.classList.contains('active')) return;

    // 移除hover类
    card.classList.remove('hover');
}

function loadMorePhotos() {
    const cardContainer = document.querySelector('.card-container');
    if (!cardContainer) {
        console.error('Card container not found');
        return;
    }

    const originalCards = Array.from(document.querySelectorAll('.card')).slice(0, 10); // 获取原始卡片（前10张）
    const startIndex = totalCards % originalCards.length; // 计算下一个要添加的卡片索引

    // 按顺序添加5张新卡片
    for (let i = 0; i < 5; i++) {
        const index = (startIndex + i) % originalCards.length;
        const newCard = originalCards[index].cloneNode(true);
        cardContainer.appendChild(newCard);
    }

    // 更新卡片列表和总数
    cards = document.querySelectorAll('.card');
    totalCards = cards.length;
}

// 更新事件监听器
document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector('.gallery');
    if (gallery) {
        gallery.addEventListener('click', handleCardClick);
        gallery.addEventListener('mouseover', handleCardHover);
        gallery.addEventListener('mouseout', handleCardLeave);
    }
});

gallery.addEventListener('wheel', handleScroll, {
    passive: false
});
closeDetails.addEventListener('click', hideProjectDetails);

// 初始化卡片位置
updateCardPositions();

// 添加鼠标移动事件处理
function handleMouseMove(e) {
    const mouseX = e.clientX / window.innerWidth - 0.5;
    const mouseY = e.clientY / window.innerHeight - 0.5;

    cards.forEach((card, index) => {
        const offset = index - currentIndex;
        
        // 如果是中间的卡片（active卡片），则不添加移动效果
        if (Math.abs(offset) === 0) {
            return;
        }

        // 根据卡片与中心的距离计算移动效果
        const moveX = mouseX * 50 * Math.abs(offset);
        const moveY = mouseY * 30 * Math.abs(offset);
        const moveZ = -Math.abs(offset) * 200;

        const transform = `
            translateX(${offset * 150 + moveX}px)
            translateY(${offset * 75 + moveY}px)
            translateZ(${moveZ}px)
            scale(${Math.abs(offset) === 0 ? 1.2 : 0.8})
        `;

        card.style.transform = transform;
        card.style.transition = 'transform 0.1s ease-out';
    });
}

// 初始添加鼠标移动事件监听
document.addEventListener('mousemove', handleMouseMove);

// 添加鼠标离开时的重置效果
document.addEventListener('mouseleave', () => {
    cards.forEach((card, index) => {
        const offset = index - currentIndex;
        const transform = `
            translateX(${offset * 150}px)
            translateY(${offset * 75}px)
            translateZ(${-Math.abs(offset) * 200}px)
            scale(${Math.abs(offset) === 0 ? 1.2 : 0.8})
            rotateY(0deg)
            rotateX(0deg)
        `;
        
        card.style.transform = transform;
        card.style.transition = 'transform 0.3s ease-out';
    });
});

// 动轮播
// setInterval(() => {
//     currentIndex = (currentIndex + 1) % totalCards;
//     updateCardPositions();
// }, 5000);

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    cards.forEach((card, index) => {
        const offset = (index - currentIndex + totalCards) % totalCards;
        card.style.transform += `translateY(${scrollY * 0.1 * offset}px)`;
    });
});

let isDragging = false;
let startX, startY, startScrollLeft, startScrollTop;

gallery.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - gallery.offsetLeft;
    startY = e.pageY - gallery.offsetTop;
    startScrollLeft = gallery.scrollLeft;
    startScrollTop = gallery.scrollTop;
});

gallery.addEventListener('mouseleave', () => {
    isDragging = false;
});

gallery.addEventListener('mouseup', () => {
    isDragging = false;
});

gallery.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - gallery.offsetLeft;
    const y = e.pageY - gallery.offsetTop;
    const walkX = (x - startX) * 2;
    const walkY = (y - startY) * 2;
    gallery.scrollLeft = startScrollLeft - walkX;
    gallery.scrollTop = startScrollTop - walkY;
});

window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('.lazy');
    lazyImages.forEach(img => {
        img.src = img.dataset.src;
    });
});

// 监听滚动事件，加载更多照片
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        loadMorePhotos();
    }
});

// 添加事件监听器
cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.classList.add('highlight');
    });

    card.addEventListener('mouseleave', () => {
        card.classList.remove('highlight');
    });
});

updateCardPositions();

categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterCards(button.dataset.category);
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

document.addEventListener('scroll', handleScroll, { passive: false });

