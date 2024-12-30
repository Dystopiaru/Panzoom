const dystopiaru={};
dystopiaru.panzoom = class {
	settings={
		scrollMultiplier: 1.25,
	};
	start={};
	constructor(el) {
		let index = -1
		if(dystopiaru.panzoom.elements){
			index = dystopiaru.panzoom.elements.findIndex(element => element===el);
		} else {
			dystopiaru.panzoom.elements = [];
			dystopiaru.panzoom.objects = [];
		}
		if(index==-1){
			let index = dystopiaru.panzoom.elements.push(el)-1;
			dystopiaru.panzoom.objects[index] = this;
			this.el = el;	
			this.init();
		}
		return dystopiaru.panzoom.objects[index];
	};
	
	getDistance(touches) {
		const [touch1, touch2] = touches;
		const dx = touch2.clientX - touch1.clientX;
		const dy = touch2.clientY - touch1.clientY;
		return Math.sqrt(dx * dx + dy * dy);
	};
	
	init(){
		const objPanzoom = this;
		document.addEventListener('touchstart', (e) => {
			if (e.touches.length === 2) {
				e.preventDefault();
				objPanzoom.isZooming=true;
				
				objPanzoom.start.pointerDistance = objPanzoom.getDistance(e.touches);
				objPanzoom.start.width = objPanzoom.el.clientWidth;
				objPanzoom.start.height = objPanzoom.el.clientHeight;
				//средняя точка между пальцами
				objPanzoom.start.pointerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
				objPanzoom.start.pointerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
				//позиция курсора мыши относительно масштарируемого объекта
				objPanzoom.start.mapX = (window.scrollX + objPanzoom.start.pointerX - objPanzoom.el.offsetLeft) / objPanzoom.start.width;
				objPanzoom.start.mapY = (window.scrollY + objPanzoom.start.pointerY - objPanzoom.el.offsetTop) / objPanzoom.start.height;
			}
		},{passive: false});
					
		document.addEventListener('touchmove', (e) => {
			if (e.touches.length === 2 && objPanzoom.isZooming) {
				const zoomFactor = objPanzoom.getDistance(e.touches) / objPanzoom.start.pointerDistance;
				objPanzoom.el.style.width = (objPanzoom.start.width * zoomFactor)+'px';
				//средняя точка между пальцами
				const pointerX = (e.touches[0].clientX+e.touches[1].clientX)/2;
				const pointerY = (e.touches[0].clientY+e.touches[1].clientY)/2;
				//Возвращение позиции скролла
				document.documentElement.scrollLeft = objPanzoom.start.mapX * objPanzoom.el.clientWidth - pointerX + objPanzoom.el.offsetLeft;
				document.documentElement.scrollTop = objPanzoom.start.mapY * objPanzoom.el.clientHeight - pointerY + objPanzoom.el.offsetTop;
			}
		});
			
		window.addEventListener('touchend', (e) => {
			if (e.touches.length < 2) {
				objPanzoom.isZooming = false;
				objPanzoom.start={};
			}
		});

		objPanzoom.el.addEventListener("wheel", (e) => {
			e.preventDefault(); 
			const multiplier = objPanzoom.settings.scrollMultiplier;
			const width = objPanzoom.el.clientWidth;
			//позиция курсора мыши относительно масштарируемого объекта
			const mapX = (window.scrollX + e.clientX - objPanzoom.el.offsetLeft) / objPanzoom.el.clientWidth;
			const mapY = (window.scrollY + e.clientY - objPanzoom.el.offsetTop) / objPanzoom.el.clientHeight;
			//Применение множителя
			objPanzoom.el.style.width =  (e.deltaY < 0 ? width * multiplier : width / multiplier)+'px';
			//Возвращение позиции скролла
			document.documentElement.scrollLeft = mapX * objPanzoom.el.clientWidth - e.clientX + objPanzoom.el.offsetLeft;
			document.documentElement.scrollTop = mapY * objPanzoom.el.clientHeight - e.clientY + objPanzoom.el.offsetTop;
		},{passive: false});

		objPanzoom.el.addEventListener('mousedown', (e) => {
			objPanzoom.isDragging = true;
			//позиция указателя мыши
			objPanzoom.start.pointerX = e.clientX;
			objPanzoom.start.pointerY = e.clientY;	
			//текущие значнения скролла
			objPanzoom.start.scrollX = window.scrollX;
			objPanzoom.start.scrollY = window.scrollY;
			document.body.classList.add('dragging');
		});
		
		window.addEventListener('mousemove', (e) => {
			if (!objPanzoom.isDragging) return;
			window.scrollTo({
				left: objPanzoom.start.scrollX - e.clientX + objPanzoom.start.pointerX,
				top: objPanzoom.start.scrollY - e.clientY + objPanzoom.start.pointerY,
			});
		});

		window.addEventListener('mouseup', () => {
			objPanzoom.isDragging = false;
			objPanzoom.start={};
			document.body.classList.remove('dragging');
		});

		window.addEventListener('mouseleave', () => {
			objPanzoom.isDragging = false;
			objPanzoom.start={};
			document.body.classList.remove('dragging');
		});
	}
}