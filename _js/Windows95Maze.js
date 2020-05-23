///////////////Main///////////////
class Windows95Maze{
    constructor(
        MazeCanvasID='Windows95Maze',
        MazeWidth=12,
        MazeDepth=12,
        MazePosX=6,
        MazePosY=0,
        MazePosZ=11,
        EnableFloor=true,
        EnableCeiling=true,
        EnableWalls=true,
        EnableGlobe=true,
        EnableRats=true,
        EnableSigns=true,
        EnableSpinners=true,
        EnableStart=true,
        EnableEnd=true,
        
        MazeDebug=false,
        MazeAutopilot=true,
        MazeIntroAnimation=true,
        MazeSpeed=2,
        MazeTickDelta=10,
        MazeCellSize=320,
        MazeHeight=200,
        MazeCameraInitY=100,
        MazeFloorScale=1,
        MazeCeilingScale=1,
        
        EnableFog=false,
        FogColor= 0x000000,
        FogNear=100,
        FogFar=1000,
        
        WallsMaterialType='Basic',
        WallsEmissiveColor=0x000000,
        WallsEmissiveIntensity=0.0,
        WallsSpecular=0x111111,
        WallsShininess=30,
        CoolWallRarity=20,
        CoolWallZoomCrop=false,
        
        LightColor=0xFFFFFF,
        LightIntensity=1,
        LightDecay=1,
        LightDistance=0,
        
        MazeTexturePack=null,
        MazeCoolWallList=null,
        ){
        ///////User Settings//////
        this.MazeWidth = MazeWidth;
        this.MazeDepth = MazeDepth;
        
        this.PackagePath = this.GetPackagePath();
        this.MazeTexturePack = MazeTexturePack;
        this.MazeCoolWallList = MazeCoolWallList;
        this.MazeCoolWallTextures = new Array();
        this.MazeCoolWallMaterials = new Array();
        if (this.MazeTexturePack == null){
            this.MazeTexturePack = this.PackagePath+'/_Assets';
        };
        this.MazeWallImagePath = this.MazeTexturePack+'/wall.png';
        this.MazeCeilImagePath = this.MazeTexturePack+'/ceiling.png';
        this.MazeFloorImagePath = this.MazeTexturePack+'/floor.png';
        this.MazeGlobeImagePath = this.MazeTexturePack+'/globe.png';
        this.MazeStartImagePath = this.MazeTexturePack+'/start.png';
        this.MazeEndImagePath = this.MazeTexturePack+'/end.png';
        this.MazeRatImagePath = this.MazeTexturePack+'/rat.png';
        this.MazeOpenGLImagePath = this.MazeTexturePack+'/OpenGL.png';
        
        this.MazeRats = Math.ceil((this.MazeWidth*this.MazeDepth)/50);
        this.MazeSigns = Math.ceil((this.MazeWidth*this.MazeDepth)/50);
        this.MazeSpinners = Math.ceil((this.MazeWidth*this.MazeDepth)/50);
        
        this.MazeDebug = MazeDebug;
        this.MazeAutopilot = MazeAutopilot;
        this.MazeIntroAnimation = MazeIntroAnimation;
        this.MazeSpeed = MazeSpeed;
        this.MazeTickDelta = MazeTickDelta;
        this.MazeCellSize = MazeCellSize;
        this.MazeHeight = MazeHeight;
        this.MazeCameraInitY = MazeCameraInitY;
        this.MazeFloorScale = MazeFloorScale;
        this.MazeCeilingScale = MazeCeilingScale;
        
        this.EnableFog = EnableFog;
        this.FogColor = FogColor;
        this.FogNear = FogNear;
        this.FogFar = FogFar;
        
        this.WallsMaterialType = WallsMaterialType;
        this.WallsEmissiveColor = WallsEmissiveColor;
        this.WallsEmissiveIntensity = WallsEmissiveIntensity;
        this.WallsSpecular = WallsSpecular;
        this.WallsShininess = WallsShininess;
        this.CoolWallRarity = CoolWallRarity;
        this.CoolWallZoomCrop = CoolWallZoomCrop;
        
        this.LightColor = LightColor;
        this.LightIntensity = LightIntensity;
        this.LightDecay = LightDecay;
        this.LightDistance = LightDistance;
        
        this.MazeTotalWidth = this.MazeWidth*this.MazeCellSize;
        this.MazeTotalDepth = this.MazeDepth*this.MazeCellSize;
        
        this.EnableFloor = EnableFloor;
        this.EnableCeiling = EnableCeiling;
        this.EnableWalls = EnableWalls;
        this.EnableGlobe = EnableGlobe;
        this.EnableRats = EnableRats;
        this.EnableSigns = EnableSigns;
        this.EnableSpinners = EnableSpinners;
        this.EnableStart = EnableStart;
        this.EnableEnd = EnableEnd;
        //////////////////////////
        
        ////Private variables/////
        this.MazeTurning = 0; //turning
        this.MazeMovement = 0; //going
        this.MazeFlipping = 0; //flipping
        this.MazeFlipped = 0; //flipped
        this.MazeGoQueue = 0; //presses for Go()
        this.MazeTurnQueue = 0; //presses for Turn()
        this.MazeOrientation = 'n'; //face
        this.UsedCells = new Array();
        //////////////////////////
        
        ///////GenerateMaze///////
        this.MazeScene = new THREE.Scene();
        this.Maze = this.GenerateMaze(this.MazeWidth,this.MazeDepth);
        this.MazePosX = MazePosX;
        this.MazePosY = MazePosY;
        this.MazePosZ = MazePosZ;
        //////////////////////////
        
        ////////DOM Element///////
        this.MazeCanvasID = MazeCanvasID;
        this.MazeCanvas = document.getElementById(this.MazeCanvasID);
        if(this.MazeCanvas == null){
            console.log('creating default canvas');
            this.MazeCanvas = document.createElement('canvas');
            this.MazeCanvas.setAttribute("id", this.MazeCanvasID);
        };
        this.MazeContext = this.MazeCanvas.getContext('webgl2', {alpha:false});
        this.MazeRenderer = new THREE.WebGLRenderer({canvas: this.MazeCanvas, context: this.MazeContext});
        this.MazeInitResX = this.MazeCanvas.getBoundingClientRect().width;
        this.MazeInitResY = this.MazeCanvas.getBoundingClientRect().height;
        this.MazeRenderer.setSize(this.MazeInitResX, this.MazeInitResY, false);
        //////////////////////////
        
        ////LoadAssets then Go////
        this.LoadAssets().then(
            function(){
                this.CreateActors();
                this.TickInterval = setInterval(this.Tick.bind(this),this.MazeTickDelta);
                this.Animate();
            }.bind(this),
            function(error){
                console.error('Could not load all maze assets! Aborting maze!');
            }
        )
        //////////////////////////
    }
    
    LoadAssets(){
        this.AllPromises = [];
        if(this.EnableFloor){   this.CreateTexturePromise(this.MazeFloorImagePath).then(function(texture){this.MazeFloorTexture = texture}.bind(this))};
        if(this.EnableCeiling){ this.CreateTexturePromise(this.MazeCeilImagePath).then(function(texture){this.MazeCeilTexture = texture}.bind(this))};
        if(this.EnableWalls){   this.CreateTexturePromise(this.MazeWallImagePath).then(function(texture){this.MazeWallTexture = texture}.bind(this))};
        
        if(this.EnableStart){   this.CreateTexturePromise(this.MazeStartImagePath).then(function(texture){this.MazeStartTexture = texture}.bind(this))};
        if(this.EnableEnd){     this.CreateTexturePromise(this.MazeEndImagePath).then(function(texture){this.MazeEndTexture = texture}.bind(this))};
        if(this.EnableRats){    this.CreateTexturePromise(this.MazeRatImagePath).then(function(texture){this.MazeRatTexture = texture}.bind(this))};
        if(this.EnableSigns){   this.CreateTexturePromise(this.MazeOpenGLImagePath).then(function(texture){this.MazeOpenGLTexture = texture}.bind(this))};
        
        
        if(this.EnableGlobe){   };
        if (this.MazeCoolWallList != null){
            for (var i=0;i<this.MazeCoolWallList.length;++i){
                this.CreateTexturePromise(this.MazeCoolWallList[i]).then(function(texture){
                    this.MazeCoolWallTextures.push(texture);
                    this.MazeCoolWallMaterials.push(new THREE.MeshBasicMaterial({map: texture}));
                }.bind(this));
            };
        } else {
            this.CreateTexturePromise(this.MazeGlobeImagePath).then(function(texture){
            this.MazeCoolWallTextures.push(texture);
            this.MazeCoolWallMaterials.push(new THREE.MeshBasicMaterial({map: texture}));
            }.bind(this));
        };
        
        var promise = Promise.all(this.AllPromises);
        return promise;
    }
    
    //////////////Setup///////////////
    Tick(){
        if (this.MazeIntroAnimation == true) {
            var DidSomething = false;
            for(var i=0;i<this.MazeActors.length;++i) {
                if(this.MazeActors[i].mesh != null){
                    //console.log(this.MazeActors[i]);
                    if(this.MazeActors[i].mesh.scale.y < this.MazeActors[i].sizeY)
                    {
                        this.MazeActors[i].mesh.scale.y += this.MazeActors[i].sizeY/100;
                        DidSomething = true;
                    }
                }
            }
            if (!DidSomething) {
                this.MazeIntroAnimation = false;
            }
        }
        for(var i=0;i<this.MazeTickActors.length;++i) {
            this.MazeTickActors[i].tick();
        }
        if (this.MazeAutopilot == true) {
            if( !this.MazeMovement && !this.MazeTurning) {
                var Options = {
                    'n': this.MazeRows[this.MazePosZ][this.MazePosX].up,
                    'e': this.MazeRows[this.MazePosZ][this.MazePosX].right,
                    's': this.MazeRows[this.MazePosZ][this.MazePosX].down,
                    'w': this.MazeRows[this.MazePosZ][this.MazePosX].left,
                };
                var OptionKeys = ['n','e','s','w'];
                var forwardindex = OptionKeys.indexOf(this.MazeOrientation);
                var leftdir = OptionKeys[(forwardindex+3) % 4];
                
                if (!Options[leftdir]){ //if possible turn left
                    this.Turn('l');
                    this.Go('f');
                } else if (!Options[this.MazeOrientation]) { //elif possible go forward
                    this.Go('f');
                } else { //else turn right
                    this.Turn('r');
                };
            };
        };
    }
    
    Animate(){
        requestAnimationFrame(this.Animate.bind(this));
        //window.requestAnimFrame (this.Animate.bind(this));
        this.Render();
    }
    
    Render(){
        this.MazeRenderer.render(this.MazeScene, this.MazeCamera);
    }
    
    connect_cells(y,x,y2,x2){
        try{
        //&& x2>0
        //&& y2 > 0
        if (this.MazeRows[y2][x2].secluded() && x2<this.MazeRows[0].length && y2 < this.MazeRows.length)
        {
            if (y<y2) //New Cell is below
            {
                this.MazeRows[y2][x2].up=0;
                this.MazeRows[y][x].down=0;
            }
            else if(y>y2) //New Cell is above
            {
                this.MazeRows[y2][x2].down=0;
                this.MazeRows[y][x].up=0;
            }
            else if(x<x2) //New Cell is right
            {
                this.MazeRows[y2][x2].left=0;
                this.MazeRows[y][x].right=0;
            }
            else if(x>x2) //New Cell is left
            {
                this.MazeRows[y2][x2].right=0;
                this.MazeRows[y][x].left=0;
            }
            return 1
        }
        }
        catch(err){}
        return 0;
    }
    
    no_secluded_cells(width,height){
        for(var ya=0;ya<height;++ya)
        {
            for(var xa=0;xa<width;++xa)
            {
                if(this.MazeRows[ya][xa].secluded())
                {
                    return 0
                }
            }
        }
        return 1
    }
    
    deadend(yb,xb){
        if (yb > 0)
        {
            if (this.MazeRows[yb-1][xb].secluded())
            {
                return 0;
            }
        }
        if(yb < this.MazeRows.length-1)
        {
            if (this.MazeRows[yb+1][xb].secluded())
            {
                return 0;
            }
        }
        if(xb > 0)
        {
            if (this.MazeRows[yb][xb-1].secluded())
            {
                return 0;
            }
        }
        if( xb < this.MazeRows[0].length-1)
        {
            if (this.MazeRows[yb][xb+1].secluded())
            {
                return 0;
            }
        }
        
        return 1;
    }
    
    GenerateMaze(width,height){
        function Cell()
        {
            //Walls: 0: Nothing, 1: Brick, 2: Lego Globe Thing
            this.up    = 1;
            this.left  = 1;
            this.right = 1;
            this.down  = 1;
            this.walls = this.up+this.left+this.right+this.down;
            this.secluded = function()
            {
                return(this.up && this.left && this.right && this.down)
            }
        }

        //setup maze full of secluded Cells
        this.MazeRows = new Array();
        for(var y=0;y<height;++y)
        {
            this.MazeRows[y] = new Array();
            for(var x=0;x<width;++x)
            {
                this.MazeRows[y][x] = new Cell;
                if (!Math.randomint(0,10))
                {
                    switch(Math.randomint(0,3))
                    {
                        case 0:
                            this.MazeRows[y][x].up=2;
                            break;
                        case 1:
                            this.MazeRows[y][x].left=2;
                            break;
                        case 2:
                            this.MazeRows[y][x].right=2;
                            break;
                        default:
                            this.MazeRows[y][x].down=2;
                            break;
                    }
                }
            }
        }

        //Make the path
        var trail = new Array();
        var x = Math.round(width/2)-1;
        var y = height-1;
        var place=0;

        for (place=0;!this.no_secluded_cells(width,height);++place)
        //for (place=0;!no_secluded_cells.bind(this);++place)
        {
            if(this.deadend(y,x))
            {
                y = trail[place-2][0];
                x = trail[place-2][1];
                place-=2;
            }
            else
            {
                var d = Math.randomint(1,4);
                switch(d) 
                {
                    case 1: //left
                        if (this.connect_cells(y,x,y,x-1))
                        {
                            x--;
                            break;
                        }
                        else
                        {
                            d=2;
                        }
                    case 2: //right
                        if (this.connect_cells(y,x,y,x+1))
                        {
                            x++;
                            break;
                        }
                        else
                        {
                            d=3;
                        }
                    case 3: //up
                        if(this.connect_cells(y,x,y-1,x))
                        {
                            y--;
                            break;
                        }
                        else
                        {
                            d=4;
                        }
                    case 4: //down
                        if(this.connect_cells(y,x,y+1,x))
                        {
                            y++;
                        }
                        else
                        {
                            d=5;
                        }
                        break;
                    case 5: //left
                        if (this.connect_cells(y,x,y,x-1))
                        {
                            x--;
                            break;
                        }
                        else
                        {
                            d=6;
                        }
                    case 6: //right
                        if (this.connect_cells(y,x,y,x+1))
                        {
                            x++;
                            break;
                        }
                        else
                        {
                            d=7;
                        }
                    case 7: //up
                        if(this.connect_cells(y,x,y-1,x))
                        {
                            y--;
                            break;
                        }
                }
                trail[place] = [y,x];
            }
        }
        //random lego globe thing wall
        /*
        rax = Math.randomint(0,width-1);
        ray = Math.randomint(0,height-1);
        
        switch( this.MazeRows[ray][rax] )
        {
            case this.up:
                this.up = 2;
                break;
            case this.left:
                this.left=2;
                break;
            case this.right:
                this.right=2;
                break;
            case this.down:
                this.down=2;
                break;
        }
        */
    }
    
    ResetMaze(){
    }
    
    GetPackagePath(){
        var scripts = document.getElementsByTagName('script');
        for(var i=0;i<scripts.length;++i){
            var src = scripts[i].src;
            var split = src.split('/');
            var filename = split.slice(-1)[0];
            if(filename == 'Windows95Maze.js'){
                var split = scripts[i].src.split('/');
                var packagepath = split.slice(0, -2).join('/');
                return packagepath;
            };
        };
    }
    
    CreateTexturePromise(ImagePath){
        var promise = new Promise(function(resolve,reject){
            var loader = new THREE.TextureLoader();
            loader.load(
                ImagePath,
                function(texture){
                    //return texture;
                    resolve(texture);
                }.bind(this)
            )
        }.bind(this));
        this.AllPromises.push(promise);
        return promise;
    }
    
    SetSize(SizeX,SizeY){
        this.MazeRenderer.setSize(SizeX, SizeY, false);
        this.MazeCamera.aspect = SizeX/SizeY;
        this.MazeCamera.updateProjectionMatrix();
    }
    
    Resize(){
        var width = this.MazeCanvas.getBoundingClientRect().width;
        var height = this.MazeCanvas.getBoundingClientRect().height;
        this.SetSize(width, height);
    }
    //////////////////////////////////
    
    
    
    ////////////Controls//////////////
    Flip(){
        if(!this.MazeFlipping)
        {
            var flipInt = setInterval(function()
            {
                this.MazeFlipping++;
                this.MazeCamera.rotation.z -= Math.radians(1);
                if(this.MazeFlipping==180)
                {
                    this.MazeFlipping = 0;
                    this.MazeFlipped = !this.MazeFlipped;
                    clearInterval(flipInt);
                }
            }.bind(this),5);
        }
    }

    Turn(d){
        if(!this.MazeTurning && !this.MazeMovement && !this.MazeFlipping)
        {
            this.MazeTurnQueue++;
            //if(this.MazeTurnQueue<2) this fixes the infinite spin bug but makes the controls suck
            {
                if (d == 'l' && this.MazeFlipped || d == 'r' && !this.MazeFlipped)
                {
                    switch(this.MazeOrientation)
                    {
                        case 'n':
                            this.MazeOrientation = 'e';
                            break;
                        case 'e':
                            this.MazeOrientation = 's';
                            break;
                        case 's':
                            this.MazeOrientation = 'w';
                            break;
                        case 'w':
                            this.MazeOrientation = 'n';
                            break;
                    }
                    var turnInt = setInterval(function()
                    {
                        this.MazeTurning++;
                        this.MazeCamera.rotation.y -= Math.radians(1);
                        if(this.MazeTurning==90)
                        {
                            this.MazeTurning=0;
                            clearInterval(turnInt);
                        }
                    }.bind(this),1);
                } else {
                    switch(this.MazeOrientation)
                    {
                        case 'n':
                            this.MazeOrientation = 'w';
                            break;
                        case 'w':
                            this.MazeOrientation = 's';
                            break;
                        case 's':
                            this.MazeOrientation = 'e';
                            break;
                        case 'e':
                            this.MazeOrientation = 'n';
                            break;
                    }
                    var turnInt = setInterval(function()
                    {
                        this.MazeTurning++;
                        this.MazeCamera.rotation.y += Math.radians(1);
                        if(this.MazeTurning==90)
                        {
                            this.MazeTurning=0;
                            clearInterval(turnInt);
                        }
                    }.bind(this),5);
                }
            }
            //else
            {
                this.MazeTurnQueue=0;
            }
        }
    }

    Go(d){
        //I have a feeling this might be able to be simplified a bit 
        if(!this.MazeTurning && !this.MazeMovement && !this.MazeFlipping)
        {
            this.MazeGoQueue++;
            //if(this.MazeGoQueue<2)
            {
                switch(d)
                {
                    case 'f':
                    {
                        switch(this.MazeOrientation)
                        {
                            case 'n':
                                if(this.MazeDebug || !this.MazeRows[this.MazePosZ][this.MazePosX].up)
                                {    
                                    this.MazePosZ--;
                                    goInt = setInterval(function()
                                    {
                                        this.MazeMovement++;
                                        this.MazeCamera.position.z += this.MazeSpeed;
                                        if( this.MazeMovement>=this.MazeCellSize/this.MazeSpeed)
                                        {
                                            this.MazeMovement=0;
                                            this.MazeGoQueue = 0;
                                            clearInterval(goInt);
                                        }
                                    }.bind(this),1);
                                }
                                break;
                            case 's':
                                if(this.MazeDebug || !this.MazeRows[this.MazePosZ][this.MazePosX].down)
                                {
                                    this.MazePosZ++;
                                    var goInt = setInterval(function()
                                    {
                                        this.MazeMovement++;
                                        this.MazeCamera.position.z -= this.MazeSpeed;
                                        if( this.MazeMovement>=this.MazeCellSize/this.MazeSpeed)
                                        {
                                            this.MazeMovement=0;
                                            this.MazeGoQueue = 0;
                                            clearInterval(goInt);
                                        }
                                    }.bind(this),1);
                                }
                                break;
                            case 'w':
                                if(this.MazeDebug || !this.MazeRows[this.MazePosZ][this.MazePosX].left)
                                {
                                    this.MazePosX--;
                                    var goInt = setInterval(function()
                                    {
                                        this.MazeMovement++;
                                        this.MazeCamera.position.x += this.MazeSpeed;
                                        if(this.MazeMovement>=this.MazeCellSize/this.MazeSpeed)
                                        {
                                            this.MazeMovement=0;
                                            this.MazeGoQueue = 0;
                                            clearInterval(goInt);
                                        }
                                    }.bind(this),1);
                                }
                                break;
                            case 'e':
                                if(this.MazeDebug || !this.MazeRows[this.MazePosZ][this.MazePosX].right)
                                {
                                    this.MazePosX++;
                                    var goInt = setInterval(function()
                                    {
                                        this.MazeMovement++;
                                        this.MazeCamera.position.x -= this.MazeSpeed;
                                        if(this.MazeMovement>=this.MazeCellSize/this.MazeSpeed)
                                        {
                                            this.MazeMovement=0;
                                            this.MazeGoQueue = 0;
                                            clearInterval(goInt);
                                        }
                                    }.bind(this),1);
                                }
                                break;
                            default:
                                this.MazeMovement=0;
                                this.MazeGoQueue = 0;
                        }
                        break;
                    }
                    case 'b':
                    {
                        switch(this.MazeOrientation)
                        {
                            case 'n':
                                if(this.MazeDebug || !this.MazeRows[this.MazePosZ][this.MazePosX].down)
                                {    
                                    this.MazePosZ++;
                                    var goInt = setInterval(function()
                                    {
                                        this.MazeMovement++;
                                        this.MazeCamera.position.z -= this.MazeSpeed;
                                        if( this.MazeMovement>=this.MazeCellSize/this.MazeSpeed)
                                        {
                                            this.MazeMovement=0;
                                            this.MazeGoQueue = 0;
                                            clearInterval(goInt);
                                        }
                                    }.bind(this),1);
                                }
                                break;
                            case 's':
                                if(this.MazeDebug || !this.MazeRows[this.MazePosZ][this.MazePosX].up)
                                {
                                    this.MazePosZ--;
                                    var goInt = setInterval(function()
                                    {
                                        this.MazeMovement++;
                                        this.MazeCamera.position.z += this.MazeSpeed;
                                        if(this.MazeMovement>=this.MazeCellSize/this.MazeSpeed)
                                        {
                                            this.MazeMovement=0;
                                            this.MazeGoQueue = 0;
                                            clearInterval(goInt);
                                        }
                                    }.bind(this),1);
                                }
                                break;
                            case 'w':
                                if(this.MazeDebug || !this.MazeRows[this.MazePosZ][this.MazePosX].right)
                                {
                                    this.MazePosX++;
                                    var goInt = setInterval(function()
                                    {
                                        this.MazeMovement++;
                                        this.MazeCamera.position.x -= this.MazeSpeed;
                                        if(this.MazeMovement>=this.MazeCellSize/this.MazeSpeed)
                                        {
                                            this.MazeMovement=0;
                                            this.MazeGoQueue = 0;
                                            clearInterval(goInt);
                                        }
                                    }.bind(this),1);
                                }
                                break;
                            case 'e':
                                if(this.MazeDebug || !this.MazeRows[this.MazePosZ][this.MazePosX].left)
                                {
                                    this.MazePosX--;
                                    var goInt = setInterval(function()
                                    {
                                        this.MazeMovement++;
                                        this.MazeCamera.position.x += this.MazeSpeed;
                                        if(this.MazeMovement>=this.MazeCellSize/this.MazeSpeed)
                                        {
                                            this.MazeMovement=0;
                                            this.MazeGoQueue = 0;
                                            clearInterval(goInt);
                                        }
                                    }.bind(this),1);
                                }
                                break;
                        }
                    }
                }
            }
            //else
            {
                this.MazeGoQueue = 0;
            }
        }
    }
    //////////////////////////////////
    
    /////////////Actors///////////////
    CreateActors(){
        this.MazeActors = new Array();
        this.MazeTickActors = new Array();
        
        if(this.EnableFloor){       this.CreateFloor()};
        if(this.EnableCeiling){     this.CreateCeiling()};
        if(this.EnableWalls){       this.CreateWalls()};
        this.CreateCameras();
        this.CreateLights();
        
        if (this.EnableRats){       this.CreateRatActors()};
        if (this.EnableSigns){      this.CreateSignActors()};
        if (this.EnableSpinners){   this.CreateSpinnerActors()};
        if (this.EnableStart){      this.MazeActors.push(this.Start(this.MazeCamera.position.x,this.MazeHeight/2,this.MazeCamera.position.z+100))};
        //if (this.EnableEnd){        this.MazeActors.push(this.End(-this.MazeTotalWidth+(this.MazeCellSize/2),this.MazeHeight/2,-this.MazeTotalDepth+(this.MazeCellSize/2)))};
        if (this.EnableEnd){        this.MazeActors.push(this.End(0-(this.MazeCellSize/2),this.MazeHeight/2,0-(this.MazeCellSize/2)))};
        
        if (this.EnableFog){        this.CreateFog()};
    }
    
    GetRandomCellPos(Y=0){
        while(true){
            var X = -(Math.randomint(0,this.MazeWidth-1)*this.MazeCellSize) + (this.MazeCellSize/2);
            var Z = -(Math.randomint(0,this.MazeDepth-1)*this.MazeCellSize) + (this.MazeCellSize/2);
            if (!this.UsedCells.includes([X,Z])){
                break;
            }
        }
        this.UsedCells.push([X, Z]);
        return [X, Y, Z];
    }
    
    MergeMeshes (meshArr) {
        var geometry = new THREE.Geometry(),
            materials = [],
            m,
            materialPointer = 0,
            reindex = 0;

        for (var i = 0; i < meshArr.length; i++) {
            m = meshArr[i];

            if (m.material.materials) {
                for (var j = 0; j < m.material.materials.length; j++) {
                    materials[materialPointer++] = m.material.materials[j];
                }
            } else if (m.material) {
                materials[materialPointer++] = m.material;
            }
            geometry.merge(m.geometry, m.matrix, reindex);
            reindex = materialPointer;
        }
        return new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
    }
    
    ZoomCrop(image){
        var image_width = image.width;
        var image_height =  image.height;
        var image_aspect_ratio = image.width/image.height;
        var width_ratio = image.width / this.MazeCellSize;
        var height_ratio = image.height / this.MazeHeight;
        
        if (height_ratio < width_ratio){
            var corrected_width = this.MazeCellSize;
            var corrected_height = corrected_width / image_aspect_ratio;
            
        }else{
            var corrected_height = this.MazeHeight;
            var corrected_width = corrected_height * image_aspect_ratio;
        };
        return [corrected_width, corrected_height];
    }
    
    CreateWalls(){
        this.MazeCombinedWalls = new THREE.Geometry();
        this.MazeCoolWalls = new THREE.Geometry();
        
        for(var y=0;y<this.MazeDepth;++y) {
            for(var x=0;x<this.MazeWidth;++x) {
                if(this.MazeRows[y][x].up) {
                    var mesh = new THREE.Mesh( new THREE.CubeGeometry(this.MazeCellSize, this.MazeHeight, 0, 0, 0, 0) );
                    mesh.position.x = -((x+1)*this.MazeCellSize) + (this.MazeCellSize/2);
                    mesh.position.y = this.MazeHeight/2;
                    mesh.position.z = -( y*this.MazeCellSize )//(this.MazeDepth*this.MazeCellSize) - y;
                    mesh.updateMatrix();
                    this.MazeCombinedWalls.merge(mesh.geometry, mesh.matrix);
                    if(!Math.randomint(0,this.CoolWallRarity) && this.EnableGlobe){
                        var coolindex = Math.randomint(0,this.MazeCoolWallMaterials.length-1);
                        var cooltexture = this.MazeCoolWallTextures[coolindex];
                        if (this.CoolWallZoomCrop == true){
                            var size = this.ZoomCrop(cooltexture.image);
                            var corrected_width = size[0];
                            var corrected_height = size[1];
                        } else {
                            var corrected_width = this.MazeCellSize;
                            var corrected_height = this.MazeHeight;
                        };
                        var mesh = new THREE.Mesh( new THREE.CubeGeometry(corrected_width, corrected_height, 2, 0, 0, 0) );
                        mesh.position.x = -((x+1)*this.MazeCellSize) + (this.MazeCellSize/2);
                        mesh.position.y = this.MazeHeight/2;
                        mesh.position.z = -( y*this.MazeCellSize );//(this.MazeDepth*this.MazeCellSize) - y;
                        mesh.updateMatrix();
                        for(var i=0;i<mesh.geometry.faces.length;++i){
                            mesh.geometry.faces[i].materialIndex = coolindex;
                        }
                        this.MazeCoolWalls.merge(mesh.geometry, mesh.matrix);
                    };
                };
                if(this.MazeRows[y][x].left) {
                    var mesh = new THREE.Mesh( new THREE.CubeGeometry(0, this.MazeHeight, this.MazeCellSize, 0, 0, 0) );
                    mesh.position.x = -((x)*this.MazeCellSize)// - (this.MazeCellSize/2);
                    mesh.position.y = this.MazeHeight/2;
                    mesh.position.z = -( ((y+1)*this.MazeCellSize) - (this.MazeCellSize/2) );//(this.MazeDepth*this.MazeCellSize) - y;
                    mesh.updateMatrix();
                    this.MazeCombinedWalls.merge(mesh.geometry, mesh.matrix);
                    if(!Math.randomint(0,this.CoolWallRarity) && this.EnableGlobe){
                        var coolindex = Math.randomint(0,this.MazeCoolWallMaterials.length-1);
                        var cooltexture = this.MazeCoolWallTextures[coolindex];
                        if (this.CoolWallZoomCrop == true){
                            var size = this.ZoomCrop(cooltexture.image);
                            var corrected_width = size[0];
                            var corrected_height = size[1];
                        } else {
                            var corrected_width = this.MazeCellSize;
                            var corrected_height = this.MazeHeight;
                        };
                        var mesh = new THREE.Mesh( new THREE.CubeGeometry(2, corrected_height, corrected_width, 0, 0, 0) );
                        mesh.position.x = -((x)*this.MazeCellSize);// - (this.MazeCellSize/2);
                        mesh.position.y = this.MazeHeight/2;
                        mesh.position.z = -( ((y+1)*this.MazeCellSize) - (this.MazeCellSize/2) );//(this.MazeDepth*this.MazeCellSize) - y;
                        mesh.updateMatrix();
                        for(var i=0;i<mesh.geometry.faces.length;++i){
                            mesh.geometry.faces[i].materialIndex = coolindex;
                        }
                        this.MazeCoolWalls.merge(mesh.geometry, mesh.matrix);
                    };
                };
                if(this.MazeRows[y][x].down && y==this.MazeDepth-1) {//It only does this on the outside so that there aren't cloned walls all over
                    var mesh = new THREE.Mesh( new THREE.CubeGeometry(this.MazeCellSize, this.MazeHeight, 0, 0, 0, 0) );
                    mesh.position.x = -(((x+1)*this.MazeCellSize) - (this.MazeCellSize/2));
                    mesh.position.y = this.MazeHeight/2;
                    mesh.position.z = -( (y+1)*this.MazeCellSize );//(this.MazeDepth*this.MazeCellSize) - y;
                    mesh.updateMatrix();
                    this.MazeCombinedWalls.merge(mesh.geometry, mesh.matrix);
                    if(!Math.randomint(0,this.CoolWallRarity) && this.EnableGlobe){
                        var coolindex = Math.randomint(0,this.MazeCoolWallMaterials.length-1);
                        var cooltexture = this.MazeCoolWallTextures[coolindex];
                        if (this.CoolWallZoomCrop == true){
                            var size = this.ZoomCrop(cooltexture.image);
                            var corrected_width = size[0];
                            var corrected_height = size[1];
                        } else {
                            var corrected_width = this.MazeCellSize;
                            var corrected_height = this.MazeHeight;
                        };
                        var mesh = new THREE.Mesh( new THREE.CubeGeometry(corrected_width, corrected_height, 2, 0, 0, 0) );
                        mesh.position.x = -(((x+1)*this.MazeCellSize) - (this.MazeCellSize/2));
                        mesh.position.y = this.MazeHeight/2;
                        mesh.position.z = -( (y+1)*this.MazeCellSize );//(this.MazeDepth*this.MazeCellSize) - y;
                        mesh.updateMatrix();
                        for(var i=0;i<mesh.geometry.faces.length;++i){
                            mesh.geometry.faces[i].materialIndex = coolindex;
                        }
                        this.MazeCoolWalls.merge(mesh.geometry, mesh.matrix);
                    };
                };
                if(this.MazeRows[y][x].right && x==this.MazeWidth-1) {//Ditto
                    var mesh = new THREE.Mesh( new THREE.CubeGeometry(0, this.MazeHeight, this.MazeCellSize, 0, 0, 0) );
                    mesh.position.x = -((x+1)*this.MazeCellSize);// - (this.MazeCellSize/2);
                    mesh.position.y = this.MazeHeight/2;
                    mesh.position.z = - ( ((y+1)*this.MazeCellSize) - (this.MazeCellSize/2) );//(this.MazeDepth*this.MazeCellSize) - y;
                    mesh.updateMatrix();
                    this.MazeCombinedWalls.merge(mesh.geometry, mesh.matrix);
                    if(!Math.randomint(0,this.CoolWallRarity) && this.EnableGlobe){
                        var coolindex = Math.randomint(0,this.MazeCoolWallMaterials.length-1);
                        var cooltexture = this.MazeCoolWallTextures[coolindex];
                        if (this.CoolWallZoomCrop == true){
                            var size = this.ZoomCrop(cooltexture.image);
                            var corrected_width = size[0];
                            var corrected_height = size[1];
                        } else {
                            var corrected_width = this.MazeCellSize;
                            var corrected_height = this.MazeHeight;
                        };
                        var mesh = new THREE.Mesh( new THREE.CubeGeometry(2, corrected_height, corrected_width, 0, 0, 0) );
                        mesh.position.x = -((x+1)*this.MazeCellSize);// - (this.MazeCellSize/2);
                        mesh.position.y = this.MazeHeight/2;
                        mesh.position.z = - ( ((y+1)*this.MazeCellSize) - (this.MazeCellSize/2) );//(this.MazeDepth*this.MazeCellSize) - y;
                        mesh.updateMatrix();
                        for(var i=0;i<mesh.geometry.faces.length;++i){
                            mesh.geometry.faces[i].materialIndex = coolindex;
                        }
                        this.MazeCoolWalls.merge(mesh.geometry, mesh.matrix);
                    };
                };
            };
        };
        
        if(this.EnableGlobe){
            var MazeCoolWallsActor = new Actor(0,0,0);
            MazeCoolWallsActor.tick = function(){}.bind(this);
            this.MazeCoolWallsMesh = new THREE.Mesh(this.MazeCoolWalls, this.MazeCoolWallMaterials);
            MazeCoolWallsActor.mesh = this.MazeCoolWallsMesh;
            if (this.MazeIntroAnimation == true) {
                MazeCoolWallsActor.sizeY = 1;
                MazeCoolWallsActor.mesh.scale.y = .05; //For Intro animation
            } else {
                MazeCoolWallsActor.mesh.scale.y = 1; //For Intro animation
            }
            
            this.MazeScene.add(this.MazeCoolWallsMesh);
            this.MazeActors.push(MazeCoolWallsActor);
        };
        
        if (this.WallsMaterialType == 'Basic'){
            this.MazeWallsMaterial = new THREE.MeshBasicMaterial({map: this.MazeWallTexture});
        } else if (this.WallsMaterialType == 'Lambert'){
            this.MazeWallsMaterial = new THREE.MeshLambertMaterial({
                map: this.MazeWallTexture,
                emissive: this.WallsEmissiveColor,
                emissiveIntensity: this.WallsEmissiveIntensity,
                emissiveMap: this.MazeWallTexture,
            });
        } else if (this.WallsMaterialType == 'Phong'){
            this.MazeWallsMaterial = new THREE.MeshPhongMaterial({
                map: this.MazeWallTexture,
                emissive: this.WallsEmissiveColor,
                emissiveIntensity: this.WallsEmissiveIntensity,
                emissiveMap: this.MazeWallTexture,
                specular: this.WallsSpecular,
                shininess: this.WallsShininess,
            });
        };
        var MazeWallsActor = new Actor(0,0,0);
        MazeWallsActor.tick = function(){}.bind(this);
        this.MazeWallsMesh = new THREE.Mesh(this.MazeCombinedWalls, this.MazeWallsMaterial);
        MazeWallsActor.mesh = this.MazeWallsMesh;
        if (this.MazeIntroAnimation == true) {
            MazeWallsActor.sizeY = 1;
            MazeWallsActor.mesh.scale.y = .05; 
        } else {
            MazeWallsActor.mesh.scale.y = 1; //For Intro animation
        }

        
        
        this.MazeScene.add(this.MazeWallsMesh);
        this.MazeActors.push(MazeWallsActor);
        
    }
    
    CreateFog(){
        const color = new THREE.Color(this.FogColor);
        this.MazeScene.fog = new THREE.Fog(color, this.FogNear, this.FogFar);
        
        this.MazeScene.background = color;
    }
    
    CreateLights(){
        var LightActor = new Actor(0,0,0);
        
        LightActor.PointLight = new THREE.PointLight(
            this.LightColor,
            this.LightIntensity,
            this.LightDistance,
            this.LightDecay,
            );
        LightActor.tick = function(){
            LightActor.PointLight.position.x = this.MazeCamera.position.x;
            LightActor.PointLight.position.y = this.MazeCamera.position.y;
            LightActor.PointLight.position.z = this.MazeCamera.position.z;
        }.bind(this);
        
        this.MazeScene.add(LightActor.PointLight);
        this.MazeActors.push(LightActor);
    }
    
    CreateCameras(){
        this.MazeCamera = new THREE.PerspectiveCamera( 75, this.MazeInitResX/this.MazeInitResY, 1, 10000 );
        this.MazeCamera.position.z = -((this.MazePosZ*this.MazeCellSize) + (this.MazeCellSize)/2) //+ (this.MazeCellSize/2);
        this.MazeCamera.position.y = this.MazeCameraInitY;
        this.MazeCamera.position.x = -(this.MazePosX*this.MazeCellSize + (this.MazeCellSize/2));//-(this.MazeWidth*this.MazeCellSize)/2 - (this.MazeCellSize/2);
        this.MazeCamera.rotation.y = Math.radians(180);
        this.MazeCamera.updateProjectionMatrix();
        this.MazeScene.add(this.MazeCamera);
    }
    
    CreateFloor(){
        this.MazeFloorGeometry = new THREE.CubeGeometry(this.MazeTotalWidth, 0, this.MazeTotalDepth, 1, 1, 1, null);
        this.MazeFloorTexture.wrapS = THREE.RepeatWrapping;
        this.MazeFloorTexture.wrapT = THREE.RepeatWrapping;
        this.MazeFloorTexture.offset.x = 0;
        this.MazeFloorTexture.offset.y = 0;
        this.MazeFloorTexture.repeat.x = (this.MazeTotalWidth)/this.MazeFloorTexture.image.width/this.MazeFloorScale;
        this.MazeFloorTexture.repeat.y = (this.MazeTotalDepth)/this.MazeFloorTexture.image.height/this.MazeFloorScale;
        
        if (this.WallsMaterialType == 'Basic'){
            this.MazeFloorMaterial = new THREE.MeshBasicMaterial({map: this.MazeFloorTexture});
        } else if (this.WallsMaterialType == 'Lambert'){
            this.MazeFloorMaterial = new THREE.MeshLambertMaterial({
                map: this.MazeFloorTexture,
                emissive: this.WallsEmissiveColor,
                emissiveIntensity: this.WallsEmissiveIntensity,
                emissiveMap: this.MazeFloorTexture,
            });
        } else if (this.WallsMaterialType == 'Phong'){
            this.MazeFloorMaterial = new THREE.MeshPhongMaterial({
                map: this.MazeFloorTexture,
                emissive: this.WallsEmissiveColor,
                emissiveIntensity: this.WallsEmissiveIntensity,
                emissiveMap: this.MazeFloorTexture,
                specular: this.WallsSpecular,
                shininess: this.WallsShininess,
            });
        }
        
        this.MazeFloorMesh = new THREE.Mesh(this.MazeFloorGeometry, this.MazeFloorMaterial);
        this.MazeFloorMesh.position.z = -(this.MazeTotalDepth/2);
        this.MazeFloorMesh.position.y = 0;
        this.MazeFloorMesh.position.x = -this.MazeTotalWidth/2;
        this.MazeScene.add(this.MazeFloorMesh);
    }
    
    CreateCeiling(){
        this.MazeCeilGeometry = new THREE.CubeGeometry(this.MazeTotalWidth, 0, this.MazeTotalDepth, 1, 1, 1, null);
        this.MazeCeilTexture.wrapS = this.MazeCeilTexture.wrapT = THREE.RepeatWrapping;
        this.MazeCeilTexture.offset.x = 0;
        this.MazeCeilTexture.offset.y = 0;
        this.MazeCeilTexture.repeat.x = (this.MazeTotalWidth)/this.MazeCeilTexture.image.width/this.MazeCeilingScale;
        this.MazeCeilTexture.repeat.y = (this.MazeTotalDepth)/this.MazeCeilTexture.image.height/this.MazeCeilingScale;
        
        if (this.WallsMaterialType == 'Basic'){
            this.MazeCeilMaterial = new THREE.MeshBasicMaterial({map: this.MazeCeilTexture});
        } else if (this.WallsMaterialType == 'Lambert'){
            this.MazeCeilMaterial = new THREE.MeshLambertMaterial({
                map: this.MazeCeilTexture,
                emissive: this.WallsEmissiveColor,
                emissiveIntensity: this.WallsEmissiveIntensity,
                emissiveMap: this.MazeCeilTexture,
            });
        } else if (this.WallsMaterialType == 'Phong'){
            this.MazeCeilMaterial = new THREE.MeshPhongMaterial({
                map: this.MazeCeilTexture,
                emissive: this.WallsEmissiveColor,
                emissiveIntensity: this.WallsEmissiveIntensity,
                emissiveMap: this.MazeCeilTexture,
                specular: this.WallsSpecular,
                shininess: this.WallsShininess,
            });
        };
        
        this.MazeCeilMesh = new THREE.Mesh(this.MazeCeilGeometry, this.MazeCeilMaterial);
        this.MazeCeilMesh.position.z = -(this.MazeTotalDepth / 2);
        this.MazeCeilMesh.position.y = this.MazeHeight;
        
        this.MazeCeilMesh.position.x = -this.MazeTotalWidth / 2;
        this.MazeScene.add(this.MazeCeilMesh);
    }
    
    CreateSignActors(){
        for(var i=0;i<this.MazeSigns;++i)
        {
            this.MazeActors.push(this.OpenGLSign(...this.GetRandomCellPos(this.MazeHeight/2)));
        }
    }
    
    CreateSpinnerActors(){
        for(var i=0;i<this.MazeSpinners;++i)
        {
            var spinner = this.Spinner(...this.GetRandomCellPos(50));
            this.MazeActors.push(spinner);
            this.MazeTickActors.push(spinner);
        }
    }

    Start(X,Y,Z){
        var StartActor = new Actor(X,Y,Z);
        StartActor.name="start";
        StartActor.AddMesh(new THREE.Mesh(
            new THREE.CubeGeometry(100, 100, 0, 1, 1, 1, null),
            new THREE.MeshBasicMaterial({map: this.MazeStartTexture})
        ));
        StartActor.mesh.material.transparent=true;
        StartActor.mesh.material.opacity=0.5;
        if (this.MazeIntroAnimation == true) {
            StartActor.sizeY = 1;
            StartActor.mesh.scale.y = 0.05; //For Intro animation
        } else {
            StartActor.mesh.scale.y = 1;
        }
        
        
        this.MazeScene.add(StartActor.mesh);
        StartActor.tick = function()
        {
            StartActor.mesh.rotation.y = this.MazeCamera.rotation.y;
        }.bind(this);
        return StartActor;
    }
    
    End(X,Y,Z){
        var EndActor = new Actor(X,Y,Z);
        EndActor.AddMesh(new THREE.Mesh(
            new THREE.CubeGeometry(100, 100, 0, 1, 1, 1, null),
            new THREE.MeshBasicMaterial({map: this.MazeEndTexture})
        ));
        EndActor.mesh.material.transparent=true;
        EndActor.mesh.material.opacity=0.5;
        EndActor.mesh.scale.x = 1.25;
        //EndActor.mesh.position.x = X;
        //EndActor.mesh.position.y = Y;
        //EndActor.mesh.position.z = Z;
        
        if (this.MazeIntroAnimation == true) {
            EndActor.sizeY = 1;
            EndActor.mesh.scale.y = 0.05; //For Intro animation
        } else {
            EndActor.mesh.scale.y = 1;
        }
        
        this.MazeScene.add(EndActor.mesh)
        EndActor.tick = function()
        {
            EndActor.mesh.rotation.y = this.MazeCamera.rotation.y;
            if(Math.abs(EndActor.mesh.position.z - this.MazeCamera.position.z) < 10 && Math.abs(EndActor.mesh.position.x - this.MazeCamera.position.x) < 10)
            {
                /*
                endInterval = setInterval(function()
                {
                    if (this.MazeWallsMesh.scale.y > 0)
                    {
                        this.MazeWallsMesh.scale.y -= .01;
                        this.MazeCoolWallsMesh.scale.y -= .01;
                        for(i=0;i<this.MazeActors.length-1;++i)
                        {
                            this.MazeActors[i].mesh.scale.y -= .01;
                        }
                    }
                    else
                    {
                        //if(!this.MazeEnded)
                        //{
                        //    this.MazeEnded = 1;
                        //}
                        clearInterval(endInterval);
                        
                        this.ResetMaze();
                        //clearInterval(updateWorld);
                    }
                },10);
                */
            }
        }.bind(this);
        return EndActor;
    }

    OpenGLSign(X,Y,Z){
        var SignActor = new Actor(X,Y,Z);
        SignActor.AddMesh(new THREE.Mesh(
            new THREE.CubeGeometry( 100, 100, 0, 1, 1, 1, null),
            new THREE.MeshBasicMaterial({map: this.MazeOpenGLTexture})
        ));
        SignActor.mesh.material.transparent=true;
        SignActor.mesh.material.opacity=0.5;
        
        if (this.MazeIntroAnimation == true) {
            SignActor.sizeY = 1;
            SignActor.mesh.scale.y = 0.05; //For Intro animation
        } else {
            SignActor.mesh.scale.y = 1;
        }


        this.MazeScene.add(SignActor.mesh);
        
        SignActor.tick = function()
        {
            SignActor.mesh.rotation.y = this.MazeCamera.rotation.y;
        }.bind(this);
        return SignActor;
    }
    
    CreateRatActors(){
        for(var i=0;i<this.MazeRats;++i)
        {
            var X = Math.randomint(0,this.MazeWidth-1);
            var Z = Math.randomint(0,this.MazeDepth-1);
            //var X = Math.randomint(0,this.MazeTotalWidth) + this.MazeCellSize/2;
            //var Z = Math.randomint(0,this.MazeTotalDepth) + this.MazeCellSize/2;
            var rat = this.Rat(X,50,Z)
            this.MazeActors.push(rat);
            this.MazeTickActors.push(rat);
        }
    }
    
    Rat(X,Y,Z){
        var RatActor = new Actor(X,Y,Z);
        RatActor.AddMesh(new THREE.Mesh(
            new THREE.CubeGeometry( 100, 100, 0, 1, 1, 1, null),
            new THREE.MeshBasicMaterial({map: this.MazeRatTexture})
        ));
        
        RatActor.mesh.material.transparent=true;
        if (this.MazeIntroAnimation == true) {
            RatActor.sizeY = 1;
            RatActor.mesh.scale.y = 0.05; //For Intro animation
        } else {
            RatActor.mesh.scale.y = 1;
        }
        
        RatActor.mesh.position.z = -((RatActor.z*this.MazeCellSize) + (this.MazeCellSize)/2);
        RatActor.mesh.position.x = -((RatActor.x*this.MazeCellSize) + (this.MazeCellSize)/2);
        //RatActor.mesh.position.z = -((RatActor.z) + (this.MazeCellSize)/2);
        //RatActor.mesh.position.x = -((RatActor.x) + (this.MazeCellSize)/2);
        
        this.MazeScene.add(RatActor.mesh);
        RatActor.m=0;
        
        RatActor.tick = function()
        {
            //return;
            RatActor.mesh.rotation.y = this.MazeCamera.rotation.y;
            if(!RatActor.m)
            {
                var randey = Math.randomint(0,3);
                switch(randey)
                {
                    case 0:
                        if(!this.MazeRows[RatActor.z][RatActor.x].up)
                        {
                            RatActor.z--;
                            var that = RatActor;
                            RatActor.ratInterval = setInterval(function()
                            {
                                that.m++
                                that.mesh.position.z++;
                                if(that.m == this.MazeCellSize)
                                {
                                    that.m=0;
                                    clearInterval(that.ratInterval);
                                }
                            },1);
                        }
                        break;
                    case 1:
                        if(!this.MazeRows[RatActor.z][RatActor.x].down && RatActor.z>1)
                        {
                            RatActor.z++;
                            var that = RatActor;
                            RatActor.ratInterval = setInterval(function()
                            {
                                that.m++
                                that.mesh.position.z--;
                                if(that.m == this.MazeCellSize)
                                {
                                    that.m=0;
                                    clearInterval(that.ratInterval);
                                }
                            },1);
                        }
                        break;
                    case 2:
                        if(!this.MazeRows[RatActor.z][RatActor.x].right)
                        {
                            RatActor.x++;
                            var that = RatActor;
                            RatActor.ratInterval = setInterval(function()
                            {
                                that.m++
                                that.mesh.position.x--;
                                if(that.m == this.MazeCellSize)
                                {
                                    that.m=0;
                                    clearInterval(that.ratInterval);
                                }
                            },1);
                        }
                        break;
                    case 3:
                        if(!this.MazeRows[RatActor.z][RatActor.x].left)
                        {
                            RatActor.x--;
                            var that = RatActor;
                            RatActor.ratInterval = setInterval(function()
                            {
                                that.m++
                                that.mesh.position.x++;
                                if(that.m == this.MazeCellSize)
                                {
                                    that.m=0;
                                    clearInterval(that.ratInterval);
                                }
                            },1);
                        }
                        break;
                }
            }
        }.bind(this);
        return RatActor;
    }

    Spinner(X,Y,Z){
        var SpinnerActor = new Actor(X,Y,Z);
        SpinnerActor.AddMesh(new THREE.Mesh(
            new THREE.IcosahedronGeometry(),
            new THREE.MeshPhongMaterial({ color: 0xcccccc, specular: 0xffffff})
        ));
        SpinnerActor.mesh.scale.x=50;
        if (this.MazeIntroAnimation == true) {
            SpinnerActor.sizeY = 50;
            SpinnerActor.mesh.scale.y = 0.05; //For Intro animation
        } else {
            SpinnerActor.mesh.scale.y = 50;
        }
        
        SpinnerActor.mesh.scale.z=50;

        this.MazeScene.add(SpinnerActor.mesh);
        SpinnerActor.tick = function()
        {
            SpinnerActor.mesh.rotation.y += Math.radians(1);
            if(Math.abs(SpinnerActor.mesh.position.z - this.MazeCamera.position.z) < 10 && Math.abs(SpinnerActor.mesh.position.x - this.MazeCamera.position.x) < 10)
            {
                this.Flip();
                SpinnerActor.mesh.scale.x=0;
                SpinnerActor.mesh.scale.y=0;
                SpinnerActor.mesh.scale.z=0;
                SpinnerActor.tick = function(){return 0}
            }
        }.bind(this);
        return SpinnerActor;
    }
    //////////////////////////////////
}

class Actor{
    constructor(x,y,z){
        this.x = x;
        this.y = y;
        this.z = z;
    }
    AddMesh(mesh){
        this.mesh = mesh;
        this.mesh.position.x = this.x;
        this.mesh.position.y = this.y;
        this.mesh.position.z = this.z;
    }
}
//////////////////////////////////

//////////Helper Functions////////
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame || 
    window.oRequestAnimationFrame ||  
    window.msRequestAnimationFrame || 
    function(callback){
        window.setTimeout(callback, 1000.0/window.frameRate);
    };
})();

Math.randomint = function(min,max){ 
    return Math.floor(Math.random()*(max-min+1))+min
}

Math.radians = function(n){
    return n*(Math.PI/180);
}
//////////////////////////////////
