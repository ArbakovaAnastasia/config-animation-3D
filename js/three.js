import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const container = document.getElementById('animation');

// Сцена
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);

// Позиция камеры
camera.position.set(0, 0, 15);
camera.lookAt(scene.position);

// Рендерер с прозрачным фоном
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// OrbitControls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.25;
// controls.screenSpacePanning = false;
// оси
// const axesHelper = new THREE.AxesHelper(5); // Длина осей 5 единиц
// scene.add(axesHelper);

// свет
const pointLight = new THREE.PointLight(0xAAffff, 1, 100);
pointLight.position.set(0, 0, 20);
scene.add(pointLight);
const directionalLight = new THREE.DirectionalLight(0xAAffff, 1);
directionalLight.position.set(0, 0, 20);
scene.add(directionalLight);

// модели GLB
const loadingManager = new THREE.LoadingManager();
const loader = new GLTFLoader(loadingManager);
let models = []; 
let initialRotations = [];
let isAnimating = false; 

// Функция для загрузки модели с возвращением промиса
function loadModel(url, position, rotation, scale) {
    return new Promise((resolve, reject) => {
        loader.load(url, (glb) => {
            const model = glb.scene;
            scene.add(model);
            model.position.set(...position);
            model.rotation.set(...rotation);
            model.scale.set(...scale);
            models.push(model);
            initialRotations.push(model.rotation.clone());
            resolve(); // Успешная загрузка
        }, undefined, (error) => {
            console.error(`Ошибка при загрузке модели ${url}:`, error);
            reject(error); // Ошибка загрузки
        });
    });
}

// Функция для последовательной загрузки моделей
async function loadModelsSequentially() {
    await loadModel('assets/models/wordC.glb', [-20, -3, 0], [0, 1.9, 0], [2.5, 2.5, 2.5]);
    await loadModel('assets/models/wordO.glb', [-11, -3, 0], [0, 1.7, 0], [2.5, 2.5, 2.5]);
    await loadModel('assets/models/wordN.glb', [-1.5, -3, 0], [0, 1.6, 0], [2.5, 2.5, 2.5]);
    await loadModel('assets/models/wordF.glb', [7, -3, 0], [0, 1.4, 0], [2.5, 2.5, 2.5]);
    await loadModel('assets/models/wordI.glb', [12, -3, 0], [0, 1.2, 0], [2.5, 2.5, 2.5]);
    await loadModel('assets/models/wordG.glb', [20, -3, 0], [0, 1, 0], [2.5, 2.5, 2.5]);
}

// Вызов функции для загрузки моделей
loadModelsSequentially().then(() => {
    console.log('Все модели загружены!');
}).catch((error) => {
    console.error('Ошибка при загрузке моделей:', error);
});


// Основная функция рендеринга
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

render();

// Функция анимации
function animateModels() {
    isAnimating = true;
    const duration = 2000; // Длительность анимации
    const frames = 125; // Количество кадров

    models.forEach((model, index) => {
        let frame = 0;
        const animate = () => {
            if (frame < frames) {
                model.rotation.y += 0.05;
                frame++;
                requestAnimationFrame(animate);
            } else {
                model.rotation.copy(initialRotations[index]); // Возврат к начальному состоянию
            }
        };

        setTimeout(animate, index  * 2 * (duration / models.length)); // Задержка между анимациями
    });

    // Завершение анимации через общее время
    setTimeout(() => {
        isAnimating = false;
    }, duration + models.length * (duration / models.length) + 1500);
}

// Обработчик события для наведения мыши
container.addEventListener('mousemove', () => {
    if (!isAnimating) {
        animateModels();
    }
});

// Обработчик события для нажатия по кнопке
const playButton = document.querySelector('.intro__picture-btn');
playButton.addEventListener('click', () => {
    if (!isAnimating) {
        animateModels();
    }
});

// код от одновременного вращения

// Основная функция рендеринга
// function render() {
//     requestAnimationFrame(render);
//     if (isAnimating) {
//         models.forEach(model => {
//             model.rotation.y += 0.05;
//         });
//     }
//     renderer.render(scene, camera);
// }

// render();

// // Обработчик события для наведения мыши
// container.addEventListener('mousemove', () => {
//     if (!isAnimating) {
//         isAnimating = true;

//         setTimeout(() => {
//             isAnimating = false;
//             models.forEach((model, index) => {
//                 model.rotation.copy(initialRotations[index]);
//             });
//         }, 2100);
//     }
// });

// // Обработчик события для нажатия по кнопке
// const playButton = document.querySelector('.intro__picture-btn');
// playButton.addEventListener('click', () => {
//     if (!isAnimating) {
//         isAnimating = true;

//         setTimeout(() => {
//             isAnimating = false;
//             models.forEach((model, index) => {
//                 model.rotation.copy(initialRotations[index]);
//             });
//         }, 2100);
//     }
// });

// Обновление размера канваса при изменении размера окна
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});