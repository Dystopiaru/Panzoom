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
			this.elScroller = this.scrollerClosest(el); 
			this.init();
		}
		return dystopiaru.panzoom.objects[index];
	};
	
	scrollerClosest = function(elChild) {
		if (elChild == null) {
			return null;
		}
		if (elChild.scrollHeight > elChild.clientHeight || elChild.scrollWidth > elChild.clientWidth) {
			return elChild;
		} else {
			return this.scrollerClosest(elChild.parentNode);
		}
	}

	getDistance(touches) {
		const [touch1, touch2] = touches;
		const dx = touch2.clientX - touch1.clientX;
		const dy = touch2.clientY - touch1.clientY;
		return Math.sqrt(dx * dx + dy * dy);
	};
	
  trigger(el,eventName){
    let event = new Event('dystopiaru.panzoom.'+eventName, {bubbles: true});		
    el.dispatchEvent(event); 	
  }
	
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
				objPanzoom.start.mapX = (objPanzoom.elScroller.scrollLeft + objPanzoom.start.pointerX - objPanzoom.el.offsetLeft) / objPanzoom.start.width;
				objPanzoom.start.mapY = (objPanzoom.elScroller.scrollTop + objPanzoom.start.pointerY - objPanzoom.el.offsetTop) / objPanzoom.start.height;
				document.body.classList.add('dragging');
			}
		},{passive: false});
					
		document.addEventListener('touchmove', (e) => {
			if (e.touches.length === 2 && objPanzoom.isZooming) {
				objPanzoom.trigger(objPanzoom.el,'zoom.start');
				const zoomFactor = objPanzoom.getDistance(e.touches) / objPanzoom.start.pointerDistance;
				//средняя точка между пальцами
				const pointerX = (e.touches[0].clientX+e.touches[1].clientX)/2;
				const pointerY = (e.touches[0].clientY+e.touches[1].clientY)/2;
				//Возвращение позиции скролла
				const width = objPanzoom.start.width * zoomFactor;
				const height = objPanzoom.start.height * zoomFactor;
				const offsetX = objPanzoom.el.offsetLeft + objPanzoom.elScroller.offsetLeft;
				const offsetY = objPanzoom.el.offsetTop + objPanzoom.elScroller.offsetTop;	
				//window.requestAnimationFrame(() => {
					objPanzoom.el.style.width = width+'px';
					objPanzoom.elScroller.scrollTo(
						objPanzoom.start.mapX * width - pointerX + offsetX,
						objPanzoom.start.mapY * height - pointerY + offsetY
					);
				//});
			}
		});
			
		window.addEventListener('touchend', (e) => {
			if (e.touches.length < 2) {
				objPanzoom.isZooming = false;
				objPanzoom.start={};
				objPanzoom.trigger(objPanzoom.el,'zoom.end');
				document.body.classList.remove('dragging');
			}
		});

		objPanzoom.el.addEventListener("wheel", (e) => {
			e.preventDefault(); 
			objPanzoom.trigger(objPanzoom.el,'zoom.start');
			const delta = e.deltaY / 100;
			const multiplier = objPanzoom.settings.scrollMultiplier;
			const startWidth = objPanzoom.el.clientWidth;
			const startHeight = objPanzoom.el.clientHeight;
			const offsetX = objPanzoom.el.offsetLeft + objPanzoom.elScroller.offsetLeft;
			const offsetY = objPanzoom.el.offsetTop + objPanzoom.elScroller.offsetTop;			
			//позиция курсора мыши относительно масштарируемого объекта
			const mapX = (objPanzoom.elScroller.scrollLeft + e.clientX - offsetX) / startWidth;
			const mapY = (objPanzoom.elScroller.scrollTop + e.clientY - offsetY) / startHeight;
			const width = delta < 0 ? startWidth * multiplier : startWidth / multiplier;
			const height = delta < 0 ? startHeight * multiplier : startHeight / multiplier;
			//window.requestAnimationFrame(() => {
				objPanzoom.el.style.width =  width+'px';
				//Возвращение позиции скролла
				objPanzoom.elScroller.scrollTo(
					mapX * width - e.clientX + offsetX, 
					mapY * height - e.clientY + offsetY
				);
			//});
			objPanzoom.trigger(objPanzoom.el,'zoom.end');
		},{passive: false});

		objPanzoom.el.addEventListener('mousedown', (e) => {
			objPanzoom.isDragging = true;
			//позиция указателя мыши
			objPanzoom.start.pointerX = e.clientX;
			objPanzoom.start.pointerY = e.clientY;	
			//текущие значнения скролла
			objPanzoom.start.scrollX = objPanzoom.elScroller.scrollLeft;
			objPanzoom.start.scrollY = objPanzoom.elScroller.scrollTop;
			document.body.classList.add('dragging');
		});
		
		window.addEventListener('mousemove', (e) => {
			if (!objPanzoom.isDragging) return;
			objPanzoom.elScroller.scrollTo(
				objPanzoom.start.scrollX - e.clientX + objPanzoom.start.pointerX, 
				objPanzoom.start.scrollY - e.clientY + objPanzoom.start.pointerY
			);
			objPanzoom.trigger(objPanzoom.el,'move.start');
		});

		window.addEventListener('mouseup', () => {
			objPanzoom.isDragging = false;
			objPanzoom.start={};
			document.body.classList.remove('dragging');
			objPanzoom.trigger(objPanzoom.el,'move.end');
		});

		window.addEventListener('mouseleave', () => {
			objPanzoom.isDragging = false;
			objPanzoom.start={};
			document.body.classList.remove('dragging');
			objPanzoom.trigger(objPanzoom.el,'move.end');
		});
	}
}