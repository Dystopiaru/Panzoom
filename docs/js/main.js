const main = class {
	//инициализация приложения 
	
	
	constructor() {
		this.init();
	};
	
	init(){
		const fetchEnabled=true;
		if(fetchEnabled){
			this.svgFetch();
		} else {
			this.svgInit();
		}
		document.addEventListener('mousedown', function (e) {
			//e.preventDefault();
			//e.stopPropagation();
			const elClick = e.target;
			const elWires= document.querySelector('[data-type="wires"]');
			if (elClick.dataset.action=='scrollto') {
				document.querySelectorAll('.active').forEach((elActive)=>{ elActive.classList.remove('active'); });
				elClick.classList.add('active');
				const elMarker = document.querySelector('#'+elClick.dataset.marker);
				if(elMarker) {
					elMarker.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'});
					elMarker.classList.add('active');
				}
			}
			if (elClick.dataset.action=='wiring') {
				document.querySelectorAll('.wiring').forEach((elActive)=>{ elActive.classList.remove('wiring'); });
				document.querySelectorAll('.active').forEach((elActive)=>{ elActive.classList.remove('active'); });
				elClick.classList.add('active');
				
				elWires.innerHTML = '';
				const arrLinks=[];
				document.querySelectorAll('[data-group="'+ elClick.dataset.group +'"]').forEach((elMarker)=>{
					elMarker.classList.add('wiring');
					const elLink = document.createElement('div');
					elLink.classList.add('scroll-btn');
					if(elClick.id==elMarker.id)	elLink.classList.add('active');
					elLink.dataset.marker=elMarker.id;
					elLink.dataset.action='scrollto';
					elLink.innerText=elMarker.innerHTML;
					arrLinks.push(elLink);
				});
				arrLinks.sort(function compare(a, b) {
					if (a.innerText < b.innerText) return -1;
					if (a.innerText > b.innerText) return 1;
					return 0;
				});
				arrLinks.forEach((elLink)=>{ elWires.append(elLink); });
			}
		});

	}
	
	svgFetch(){
		fetch('./data/scheme.svg').then(response => response.text()).then(svg => {
			document.getElementById('scheme').innerHTML = svg;
			document.getElementById('scheme').innerHTML += '<div id="copyright"><a href="https://github.com/Dystopiaru/Panzoom">https://github.com/Dystopiaru/Panzoom</a></div>';
			this.svgInit();
		});
	}
	
	svgInit(){
		const regex = /^([А-Я][а-я]?)([А-Я][а-я]?)?([0-9]{0,4})([а-я]?)$/;
		const regex2 = /^\.(.+)$/;
		const elModules = document.querySelector('[data-type="modules"]');
		const arrLinks=[];
		document.querySelectorAll('g text').forEach((elMarker,elIndex)=>{
			let match = regex.exec(elMarker.innerHTML);
			const markerId ='marker'+elIndex;
			elMarker.id = markerId;
			if(match){
				const color1=match[1];
				const color2=match[2];
				const number=match[3];
				const index=match[4];
				elMarker.classList.add('c1-'+this.colorClass(color1));
				if(color2){
					elMarker.classList.add('c2-'+this.colorClass(color2));
				} else {
					elMarker.classList.add('c2-'+this.colorClass(color1));
				}
				if(number){
					elMarker.dataset.group = this.colorClass(color1) + (color2 ? '-'+this.colorClass(color2) : '') + '-' + number;
					elMarker.dataset.action = 'wiring';
				}
				return true;
			} 
			
			match = regex2.exec(elMarker.innerHTML);
			if(match) {
				elMarker.classList.add('hide');
				const elLink = document.createElement('div');
				elLink.classList.add('scroll-btn');
				elLink.dataset.marker=markerId;
				elLink.dataset.action='scrollto';
				elLink.innerText=match[1];
				arrLinks.push(elLink);
				return true;
			}
		});
		arrLinks.sort(function compare(a, b) {
			if (a.innerText < b.innerText) return -1;
			if (a.innerText > b.innerText) return 1;
			return 0;
		});
		arrLinks.forEach((elLink)=>{ elModules.append(elLink); });
		
		const elScheme = document.getElementById('scheme');
		const objPanzoom  = new dystopiaru.panzoom(elScheme);
		/*
		const elSvg = elScheme.children[0];
		objPanzoom.el.addEventListener('dystopiaru.panzoom.zoom.start',(e)=>{
			//elSvg.style.visibility='hidden';
		});
		objPanzoom.el.addEventListener('dystopiaru.panzoom.zoom.end',(e)=>{
			//elSvg.style.visibility='visible';
		});
		objPanzoom.el.addEventListener('dystopiaru.panzoom.move.start',(e)=>{
			//elSvg.style.visibility='hidden'
		});
		objPanzoom.el.addEventListener('dystopiaru.panzoom.move.end',(e)=>{
			//elSvg.style.visibility='visible'
		});*/
	}
	
	//преобразование цветов в классы
	colorClass(title){
		switch(title){
			case 'Ч':
				return 'black';			
			case 'Г':
				return 'blue';		
			case 'Кч':
				return 'brown';					
			case 'З':
				return 'green';			
			case 'С':
				return 'grey';			
			case 'О':
				return 'orange';
			case 'Р':
				return 'pink';					
			case 'К':
				return 'red';
			case 'Ф':
				return 'violet';
			case 'Б':
				return 'white';	
			case 'Ж':
				return 'yellow';					
			default:
				return '';
		}
	}
}

objMain = new main();
