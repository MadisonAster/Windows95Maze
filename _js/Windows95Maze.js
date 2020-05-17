///////////////Main///////////////
class Windows95Maze{
    constructor(id,width,depth,resX,resY){
        ///////User Settings//////
        this.MazeWidth = width;
        this.MazeDepth = depth;
        this.MazeResX = resX;
        this.MazeResY = resY;
        
        this.PackagePath = this.GetPackagePath();
        this.MazeWallImagePath = this.PackagePath+'/_Assets/wall.png';
        this.MazeCeilImagePath = this.PackagePath+'/_Assets/ceiling.png';
        this.MazeFloorImagePath = this.PackagePath+'/_Assets/floor.png';
        this.MazeGlobeImagePath = this.PackagePath+'/_Assets/globe.png';
        this.MazeStartImagePath = this.PackagePath+'/_Assets/start.png';
        this.MazeEndImagePath = this.PackagePath+'/_Assets/end.png';
        this.MazeRatImagePath = this.PackagePath+'/_Assets/rat.png';
        this.MazeOpenGLImagePath = this.PackagePath+'/_Assets/OpenGL.png';
        
        this.MazeDebug = 0;
        this.MazeAutopilot = true;
        this.MazeRats = Math.ceil((this.MazeWidth*this.MazeDepth)/50);
        this.MazeSigns = Math.ceil((this.MazeWidth*this.MazeDepth)/50);
        this.MazeSpinners = Math.ceil((this.MazeWidth*this.MazeDepth)/50);
        this.MazeSpeed = 4;
        this.MazeTickDelta = 10;
        this.MazeCellSize = 320;
        this.MazeHeight = 200;
        
        this.MazeTotalWidth = this.MazeWidth*this.MazeCellSize;
        this.MazeTotalDepth = this.MazeDepth*this.MazeCellSize;
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
        this.MazePosX = Math.round(this.MazeWidth/2);
        this.MazePosY = 0;
        this.MazePosZ = this.MazeDepth-1;
        //////////////////////////
        
        ////////DOM Element///////
        this.MazeCanvas = document.getElementById(id);
        if(this.MazeCanvas == null){
            console.log('creating default canvas');
            this.MazeCanvas = document.createElement('canvas');
            this.MazeCanvas.setAttribute("id", id);
        };
        this.MazeContext = this.MazeCanvas.getContext('webgl2', {alpha:false});
        this.MazeRenderer = new THREE.WebGLRenderer({canvas: this.MazeCanvas, context: this.MazeContext});
        this.MazeRenderer.setSize(this.MazeResX, this.MazeResY);
        //////////////////////////
        
        ////LoadAssets then Go////
        console.log(this.src);
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
        this.CreateTexturePromise(this.MazeWallImagePath).then(function(texture){this.MazeWallTexture = texture}.bind(this));
        this.CreateTexturePromise(this.MazeCeilImagePath).then(function(texture){this.MazeCeilTexture = texture}.bind(this));
        this.CreateTexturePromise(this.MazeFloorImagePath).then(function(texture){this.MazeFloorTexture = texture}.bind(this));
        this.CreateTexturePromise(this.MazeGlobeImagePath).then(function(texture){this.MazeGlobeTexture = texture}.bind(this));
        this.CreateTexturePromise(this.MazeStartImagePath).then(function(texture){this.MazeStartTexture = texture}.bind(this));
        this.CreateTexturePromise(this.MazeEndImagePath).then(function(texture){this.MazeEndTexture = texture}.bind(this));
        this.CreateTexturePromise(this.MazeRatImagePath).then(function(texture){this.MazeRatTexture = texture}.bind(this));
        this.CreateTexturePromise(this.MazeOpenGLImagePath).then(function(texture){this.MazeOpenGLTexture = texture}.bind(this));
        
        var promise = Promise.all(this.AllPromises)
        return promise
    }
    
    //////////////Setup///////////////
    Tick(){
        for(var i=0;i<this.MazeActors.length;++i)
        {
            this.MazeActors[i].tick();
            if(this.MazeActors[i].mesh != null){
                //console.log(this.MazeActors[i]);
                if(this.MazeActors[i].mesh.scale.y < this.MazeActors[i].sizeY)
                {
                    this.MazeActors[i].mesh.scale.y += this.MazeActors[i].sizeY/100;
                }
            }
        }
    }
    
    Animate(){
        requestAnimationFrame(this.Animate.bind(this));
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
        if(!this.MazeTurning)
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
        if(!this.MazeMovement)
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
        
        this.CreateFloor();
        this.CreateCeiling();
        this.CreateWalls();
        this.CreateCameras();
        this.CreateLights();
        
        this.CreateRatActors();
        this.CreateSignActors();
        this.CreateSpinnerActors();
        this.MazeActors.push(this.Start(this.MazeCamera.position.x,100,this.MazeCamera.position.z+100));
        this.MazeActors.push(this.End(0,100,0));
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
        
    CreateWalls(){
        this.MazeCombinedWalls = new THREE.Geometry();
        this.MazeCoolWalls = new THREE.Geometry();
        
        for(var y=0;y<this.MazeDepth;++y)
        {
            for(var x=0;x<this.MazeWidth;++x)
            {
        
                if(this.MazeRows[y][x].up)
                {
                    var mesh = new THREE.Mesh( new THREE.CubeGeometry(this.MazeCellSize, this.MazeHeight, 0, 0, 0, 0) );
                    mesh.position.x = -((x+1)*this.MazeCellSize) + (this.MazeCellSize/2);
                    mesh.position.y = 100;
                    mesh.position.z = -( y*this.MazeCellSize )//(this.MazeDepth*this.MazeCellSize) - y;
                    mesh.updateMatrix();
                    if(Math.randomint(0,this.MazeWidth*this.MazeDepth))
                    {
                        this.MazeCombinedWalls.merge(mesh.geometry, mesh.matrix);
                    }
                    else
                    {
                        this.MazeCoolWalls.merge(mesh.geometry, mesh.matrix);
                    }

                }
                if(this.MazeRows[y][x].left)
                {
                    mesh = new THREE.Mesh( new THREE.CubeGeometry(0, this.MazeHeight, this.MazeCellSize, 0, 0, 0) );
                    mesh.position.x = -((x)*this.MazeCellSize)// - (this.MazeCellSize/2);
                    mesh.position.y = 100;
                    mesh.position.z = -( ((y+1)*this.MazeCellSize) - (this.MazeCellSize/2) );//(this.MazeDepth*this.MazeCellSize) - y;
                    mesh.updateMatrix();
                    if(Math.randomint(0,this.MazeWidth*this.MazeDepth))
                    {
                        this.MazeCombinedWalls.merge(mesh.geometry, mesh.matrix);
                    }
                    else
                    {
                        this.MazeCoolWalls.merge(mesh.geometry, mesh.matrix);
                    }
                }
                if(this.MazeRows[y][x].down && y==this.MazeDepth-1) //It only does this on the outside so that there aren't cloned walls all over
                {
                    mesh = new THREE.Mesh( new THREE.CubeGeometry(this.MazeCellSize, this.MazeHeight, 0, 0, 0, 0) );
                    mesh.position.x = -(((x+1)*this.MazeCellSize) - (this.MazeCellSize/2));
                    mesh.position.y = 100;
                    mesh.position.z = -( (y+1)*this.MazeCellSize );//(this.MazeDepth*this.MazeCellSize) - y;
                    mesh.updateMatrix();
                    if(Math.randomint(0,this.MazeWidth*this.MazeDepth))
                    {
                        this.MazeCombinedWalls.merge(mesh.geometry, mesh.matrix);
                    }
                    else
                    {
                        this.MazeCoolWalls.merge(mesh.geometry, mesh.matrix);
                    }
                }
                if(this.MazeRows[y][x].right && x==this.MazeWidth-1) //Ditto
                {
                    mesh = new THREE.Mesh( new THREE.CubeGeometry(0, this.MazeHeight, this.MazeCellSize, 0, 0, 0) );
                    mesh.position.x = -((x+1)*this.MazeCellSize)// - (this.MazeCellSize/2);
                    mesh.position.y = 100;
                    mesh.position.z = - ( ((y+1)*this.MazeCellSize) - (this.MazeCellSize/2) );//(this.MazeDepth*this.MazeCellSize) - y;
                    mesh.updateMatrix();
                    if(Math.randomint(0,this.MazeWidth*this.MazeDepth))
                    {
                        this.MazeCombinedWalls.merge(mesh.geometry, mesh.matrix);
                    }
                    else
                    {
                        this.MazeCoolWalls.merge(mesh.geometry, mesh.matrix);
                    }
                }    
            }
        }
        
        var MazeWallsActor = new Actor(0,0,0);
        var MazeCoolWallsActor = new Actor(0,0,0);
        MazeWallsActor.tick = function(){}.bind(this);
        MazeCoolWallsActor.tick = function(){}.bind(this);
        
        this.MazeWallsMesh = new THREE.Mesh(this.MazeCombinedWalls, new THREE.MeshBasicMaterial({map: this.MazeWallTexture}));
        this.MazeCoolWallsMesh = new THREE.Mesh(this.MazeCoolWalls, new THREE.MeshBasicMaterial({map: this.MazeGlobeTexture}));
        
        MazeWallsActor.sizeY = 1;
        MazeCoolWallsActor.sizeY = 1;
        this.MazeWallsMesh.scale.y = .05;
        this.MazeCoolWallsMesh.scale.y = .05;
        
        MazeWallsActor.mesh = this.MazeWallsMesh;
        MazeCoolWallsActor.mesh = this.MazeCoolWallsMesh;
        
        this.MazeScene.add(this.MazeWallsMesh);
        this.MazeScene.add(this.MazeCoolWallsMesh);
        
        this.MazeActors.push(MazeWallsActor);
        this.MazeActors.push(MazeCoolWallsActor);
        
    }
    
    CreateLights(){
        var LightActor = new Actor(0,0,0);
        
        LightActor.PointLight = new THREE.PointLight(0xFFFFFF);
        LightActor.tick = function(){
            LightActor.PointLight.position.x = this.MazeCamera.position.x;
            LightActor.PointLight.position.y = this.MazeCamera.position.y;
            LightActor.PointLight.position.z = this.MazeCamera.position.z;
        }.bind(this);
        
        this.MazeScene.add(LightActor.PointLight);
        this.MazeActors.push(LightActor);
    }
    
    CreateCameras(){
        this.MazeCamera = new THREE.PerspectiveCamera( 75, this.MazeResX/this.MazeResY, 1, 10000 );
        this.MazeCamera.position.z = -((this.MazePosZ*this.MazeCellSize) + (this.MazeCellSize)/2) //+ (this.MazeCellSize/2);
        this.MazeCamera.position.y = 100;
        this.MazeCamera.position.x = -(this.MazePosX*this.MazeCellSize + (this.MazeCellSize/2));//-(this.MazeWidth*this.MazeCellSize)/2 - (this.MazeCellSize/2);
        this.MazeCamera.rotation.y = Math.radians(180);
        this.MazeCamera.far = 100;// Math.max(this.MazeWidth,this.MazeDepth)*this.MazeCellSize;
        this.MazeScene.add(this.MazeCamera);
        
        console.log(this.MazeCamera.position);
    }
    
    CreateFloor(){
        this.MazeFloorGeometry = new THREE.CubeGeometry(this.MazeTotalWidth, 0, this.MazeTotalDepth, 1, 1, 1, null);
        this.MazeFloorTexture.wrapS = THREE.RepeatWrapping;
        this.MazeFloorTexture.wrapT = THREE.RepeatWrapping;
        this.MazeFloorTexture.offset.x = 0;
        this.MazeFloorTexture.offset.y = 0;
        this.MazeFloorTexture.repeat.x = (this.MazeTotalWidth)/this.MazeFloorTexture.image.width;
        this.MazeFloorTexture.repeat.y = (this.MazeTotalDepth)/this.MazeFloorTexture.image.height;
        this.MazeFloorMaterial = new THREE.MeshBasicMaterial({map: this.MazeFloorTexture});
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
        this.MazeCeilTexture.repeat.x = (this.MazeTotalWidth)/this.MazeCeilTexture.image.width;
        this.MazeCeilTexture.repeat.y = (this.MazeTotalDepth)/this.MazeCeilTexture.image.height;
        this.MazeCeilMaterial = new THREE.MeshBasicMaterial({map: this.MazeCeilTexture});
        this.MazeCeilMesh = new THREE.Mesh(this.MazeCeilGeometry, this.MazeCeilMaterial);
        this.MazeCeilMesh.position.z = -(this.MazeTotalDepth / 2);
        this.MazeCeilMesh.position.y = this.MazeHeight;
        this.MazeCeilMesh.position.x = -this.MazeTotalWidth / 2;
        this.MazeScene.add(this.MazeCeilMesh);
    }
    
    CreateSignActors(){
        for(var i=0;i<this.MazeSigns;++i)
        {
            this.MazeActors.push(this.OpenGLSign(...this.GetRandomCellPos(100)));
        }
    }
    
    CreateSpinnerActors(){
        for(var i=0;i<this.MazeSpinners;++i)
        {
            this.MazeActors.push(this.Spinner(...this.GetRandomCellPos(50)));
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
        StartActor.mesh.scale.x = 1.25;
        StartActor.mesh.scale.y = 0.05;
        StartActor.sizeY = 2;
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
            new THREE.CubeGeometry( 100, 100, 0, 1, 1, 1, null),
            new THREE.MeshBasicMaterial({map: this.MazeEndTexture})
        ));
        EndActor.mesh.material.transparent=true;
        EndActor.mesh.material.opacity=0.5;
        EndActor.mesh.scale.x = 1.25;
        EndActor.mesh.scale.y = 0.05;
        EndActor.sizeY = 1.25;
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
        
        SignActor.mesh.scale.y = 0.05;
        SignActor.sizeY = 1;

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
            this.MazeActors.push(this.Rat(X,50,Z));
        }
    }
    
    Rat(X,Y,Z){
        var RatActor = new Actor(X,Y,Z);
        RatActor.AddMesh(new THREE.Mesh(
            new THREE.CubeGeometry( 100, 50, 0, 1, 1, 1, null),
            new THREE.MeshBasicMaterial({map: this.MazeRatTexture})
        ));
        
        RatActor.mesh.material.transparent=true;
        RatActor.mesh.scale.y = 0.05;
        RatActor.sizeY = 2;
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
        SpinnerActor.mesh.scale.y=0.05;
        SpinnerActor.sizeY=50;
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
