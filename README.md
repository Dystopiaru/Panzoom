[Demo](https://dystopiaru.github.io/Panzoom/)

## Features
- Drag scroll and zoom
- Optimized for Mobile Devices
- Momentum scroll
- Lightweight
- No dependencies


## Usage:
```html
<html>
  <body>
    <div id="scheme-wrapper">
      <div id="scheme">
        <!--Your content Here-->
      </div>
    </div>
    
    <style>
    body { 
      overflow:hidden;
    }
    #scheme-wrapper {
      position: fixed;
      top:0px;
      left:0px;	
      padding: 0px;
      margin: 0px;	
      cursor: grab;
      width: 100vw;
      height: 100vh;
      overflow: scroll;
    }
    </style>
    <script src="dystopiaru.panzoom.js"></script>
    <script>
      const elScheme = document.getElementById('scheme');
      const objPanzoom  = new dystopiaru.panzoom(elScheme);
    </script>
  </body>
</html>
```
