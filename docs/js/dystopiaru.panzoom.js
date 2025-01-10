const dystopiaru={};
dystopiaru.panzoom = class {
	settings={
		scrollMultiplier: 1.25, //множитель скролла
		momentumMin: 1, //минимальная скорость инерции
		momentumMultiplier: 3, //множитель скорости инерции
		momentumFade: 0.95, //затухание инерции
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
			el.style.transformOrigin='top left';
			//this.elScroller = this.scrollerClosest(el); 
			this.elScroller = el.parentNode; 
			this.init();
		}
		return dystopiaru.panzoom.objects[index];
	};
	
	//Ближайший к элементу скролл-блок
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

	//Расстояние между тапами
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
	
	//инерционное замедление
	momentum() {
		const objPanzoom = this;
		if (Math.abs(objPanzoom.start.velocityX) < objPanzoom.settings.momentumMin && Math.abs(objPanzoom.start.velocityY) < objPanzoom.settings.momentumMin){
			document.body.classList.remove('dragging');
			return;
		}
		objPanzoom.elScroller.scrollLeft -= objPanzoom.start.velocityX * objPanzoom.settings.momentumMultiplier;
		objPanzoom.elScroller.scrollTop -= objPanzoom.start.velocityY * objPanzoom.settings.momentumMultiplier;
		objPanzoom.start.velocityX *= objPanzoom.settings.momentumFade;
		objPanzoom.start.velocityY *= objPanzoom.settings.momentumFade;
		objPanzoom.frameMomentum = window.requestAnimationFrame(() => { objPanzoom.momentum(); });
	}	
	
	init(){
		const objPanzoom = this;
		objPanzoom.frameMomentum=false;
		objPanzoom.frameScale=false;
		objPanzoom.scale=1;
		
		objPanzoom.el.addEventListener('touchstart', (e) => {
			
			document.body.classList.add('dragging');

			if (e.touches.length === 2) {
				cancelAnimationFrame(objPanzoom.frameMomentum);
				//objPanzoom.trigger(objPanzoom.el,'zoom.start');
				e.preventDefault();
				objPanzoom.isZooming=true;
				objPanzoom.start.pointerDistance = objPanzoom.getDistance(e.touches);
				objPanzoom.start.width = objPanzoom.el.clientWidth*objPanzoom.scale;
				objPanzoom.start.height = objPanzoom.el.clientHeight*objPanzoom.scale;
				//средняя точка между пальцами
				objPanzoom.start.pointerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
				objPanzoom.start.pointerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
				//позиция курсора мыши относительно масштарируемого объекта
				objPanzoom.start.mapX = (objPanzoom.elScroller.scrollLeft + objPanzoom.start.pointerX - objPanzoom.el.offsetLeft) / objPanzoom.start.width;
				objPanzoom.start.mapY = (objPanzoom.elScroller.scrollTop + objPanzoom.start.pointerY - objPanzoom.el.offsetTop) / objPanzoom.start.height;
				objPanzoom.start.scale = objPanzoom.scale;
			}
		},{passive: false});
					
		document.addEventListener('touchmove', (e) => {
			if (e.touches.length === 2 && objPanzoom.isZooming) {
				
				if(objPanzoom.trottle) return;
				objPanzoom.trottle = true;
				//cancelAnimationFrame(objPanzoom.frameScale);				
				
				const zoomFactor = objPanzoom.getDistance(e.touches) / objPanzoom.start.pointerDistance;
				//средняя точка между пальцами
				const pointerX = (e.touches[0].clientX+e.touches[1].clientX)/2;
				const pointerY = (e.touches[0].clientY+e.touches[1].clientY)/2;
				const width = objPanzoom.start.width * zoomFactor;
				const height = objPanzoom.start.height * zoomFactor;
				const offsetX = objPanzoom.el.offsetLeft + objPanzoom.elScroller.offsetLeft;
				const offsetY = objPanzoom.el.offsetTop + objPanzoom.elScroller.offsetTop;	
				objPanzoom.scale = zoomFactor*objPanzoom.start.scale;
				//Возвращение позиции скролла
				objPanzoom.frameScale = window.requestAnimationFrame(() => {
					//objPanzoom.el.style.width = width+'px';
					if(objPanzoom.scale>1){
						objPanzoom.el.style.transform = 'scale('+objPanzoom.scale+')';
						objPanzoom.elScroller.scrollTo(
							objPanzoom.start.mapX * width - pointerX + offsetX,
							objPanzoom.start.mapY * height - pointerY + offsetY
						);
					} else {
						objPanzoom.elScroller.scrollTo(
							objPanzoom.start.mapX * width - pointerX + offsetX,
							objPanzoom.start.mapY * height - pointerY + offsetY
						);
						objPanzoom.el.style.transform = 'scale('+objPanzoom.scale+')';
					}
					objPanzoom.trottle=false;
				});
			}
		});
			
		window.addEventListener('touchend', (e) => {
			if (e.touches.length < 2) {
				objPanzoom.isZooming = false;
			}
			document.body.classList.remove('dragging');
		});

		objPanzoom.el.addEventListener("wheel", (e) => {
			e.preventDefault(); 
			if(objPanzoom.trottle) return;
			objPanzoom.trottle = true;
			cancelAnimationFrame(objPanzoom.frameMomentum);

			//cancelAnimationFrame(objPanzoom.frameScale);
			//objPanzoom.trigger(objPanzoom.el,'zoom.start');
			const delta = e.deltaY / 100;
			const multiplier = objPanzoom.settings.scrollMultiplier;
			const startWidth = objPanzoom.el.clientWidth * objPanzoom.scale;
			const startHeight = objPanzoom.el.clientHeight * objPanzoom.scale;

			
			const offsetX = objPanzoom.el.offsetLeft + objPanzoom.elScroller.offsetLeft;
			const offsetY = objPanzoom.el.offsetTop + objPanzoom.elScroller.offsetTop;			
			//позиция курсора мыши относительно масштарируемого объекта
			const mapX = (objPanzoom.elScroller.scrollLeft + e.clientX - offsetX) / startWidth;
			const mapY = (objPanzoom.elScroller.scrollTop + e.clientY - offsetY) / startHeight;
			const width = delta < 0 ? startWidth * multiplier : startWidth / multiplier;
			const height = delta < 0 ? startHeight * multiplier : startHeight / multiplier;
			
			if(delta < 0){
				objPanzoom.scale = objPanzoom.scale * multiplier;
			} else {
				objPanzoom.scale = objPanzoom.scale / multiplier;
			}
			
			//objPanzoom.frameScale = window.requestAnimationFrame(() => {
				//Возвращение позиции скролла
				if(objPanzoom.scale>1){
					objPanzoom.el.style.transform = 'scale('+objPanzoom.scale+')';
					objPanzoom.elScroller.scrollTo(
						mapX * width - e.clientX + offsetX, 
						mapY * height - e.clientY + offsetY
					);
				} else {
					objPanzoom.elScroller.scrollTo(
						mapX * width - e.clientX + offsetX, 
						mapY * height - e.clientY + offsetY
					);
					objPanzoom.el.style.transform = 'scale('+objPanzoom.scale+')';
				}
				objPanzoom.trottle=false;
				//objPanzoom.trigger(objPanzoom.el,'zoom.end');
			//});
		},{passive: false});

		objPanzoom.el.addEventListener('mousedown', (e) => {
			cancelAnimationFrame(objPanzoom.frameMomentum);
			objPanzoom.isDragging = true;
			//позиция указателя мыши
			objPanzoom.start.pointerX = e.clientX;
			objPanzoom.start.pointerY = e.clientY;	
			//текущие значнения скролла
			objPanzoom.start.scrollX = objPanzoom.elScroller.scrollLeft;
			objPanzoom.start.scrollY = objPanzoom.elScroller.scrollTop;
			document.body.classList.add('dragging');
			
      objPanzoom.start.velocityX = 0;
      objPanzoom.start.velocityY = 0;
      objPanzoom.start.lastX = 0;
      objPanzoom.start.lastY = 0;
      objPanzoom.start.deltaX = 0;
      objPanzoom.start.deltaY = 0;
			cancelAnimationFrame(objPanzoom.frameMomentum);
		});
		
		window.addEventListener('mousemove', (e) => {
			if (!objPanzoom.isDragging) return;
			

			//cancelAnimationFrame(objPanzoom.frameMomentum);
			
			objPanzoom.start.deltaX = e.clientX - objPanzoom.start.pointerX;
      objPanzoom.start.deltaY = e.clientY - objPanzoom.start.pointerY;
			objPanzoom.start.velocityX = objPanzoom.start.deltaX - (objPanzoom.start.lastX ||  objPanzoom.start.deltaX);
			objPanzoom.start.velocityY = objPanzoom.start.deltaY - (objPanzoom.start.lastY ||  objPanzoom.start.deltaY);
			objPanzoom.start.lastX = objPanzoom.start.deltaX;
			objPanzoom.start.lastY = objPanzoom.start.deltaY;

			if(objPanzoom.trottle) return;
			objPanzoom.trottle = true;

			objPanzoom.frameScale = window.requestAnimationFrame(() => {
				objPanzoom.elScroller.scrollTo(
					objPanzoom.start.scrollX - objPanzoom.start.deltaX, 
					objPanzoom.start.scrollY - objPanzoom.start.deltaY
				);
				objPanzoom.trottle=false;
				//objPanzoom.trigger(objPanzoom.el,'move.start');				
			});
		});

		window.addEventListener('mouseup', () => {
			objPanzoom.isDragging = false;
			objPanzoom.momentum();
			//objPanzoom.trigger(objPanzoom.el,'move.end');
		});

		window.addEventListener('mouseleave', () => {
			objPanzoom.isDragging = false;
			objPanzoom.momentum();
			//objPanzoom.trigger(objPanzoom.el,'move.end');
		});
	}

}