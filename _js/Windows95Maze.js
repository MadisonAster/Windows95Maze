///////////////Main///////////////
class Windows95Maze{
    constructor(width,depth,resX,resY){
        this.MazeWidth = width;
        this.MazeDepth = depth;
        this.MazeResX = resX;
        this.MazeResY = resY;
        
        this.MazeCanvas = document.createElement('canvas');
        this.MazeContext = this.MazeCanvas.getContext('webgl2', {alpha:false});
        this.MazeRenderer = new THREE.WebGLRenderer({canvas: this.MazeCanvas, context: this.MazeContext});
        this.MazeRenderer.setSize(this.MazeResX, this.MazeResY);
        
        //Continue construction after all assets have loaded
        this.LoadAssets().then(
            function(){
                console.log('Maze textures loaded!');
                this.constructor2();
            }.bind(this),
            function(error){
                console.error('Could not load all textures! Aborting maze!');
            }
        );
    }
    
    LoadAssets(){
        this.MazeWallImagePath = './_Assets/wall.png';
        this.MazeCeilImagePath = './_Assets/ceiling.png';
        this.MazeFloorImagePath = './_Assets/floor.png';
        this.MazeGlobeImagePath = './_Assets/globe.png';
        this.MazeEndImagePath = './_Assets/cool.png';
        this.MazeRatImagePath = './_Assets/rat2.png';
        this.MazeOpenGLFontPath = './_Assets/droid_serif_bold.typeface.json';
        
        this.AllPromises = [];
        this.CreateTexturePromise(this.MazeWallImagePath).then(function(texture){this.MazeWallTexture = texture}.bind(this));
        this.CreateTexturePromise(this.MazeCeilImagePath).then(function(texture){this.MazeCeilTexture = texture}.bind(this));
        this.CreateTexturePromise(this.MazeFloorImagePath).then(function(texture){this.MazeFloorTexture = texture}.bind(this));
        this.CreateTexturePromise(this.MazeGlobeImagePath).then(function(texture){this.MazeGlobeTexture = texture}.bind(this));
        this.CreateTexturePromise(this.MazeEndImagePath).then(function(texture){this.MazeEndTexture = texture}.bind(this));
        this.CreateTexturePromise(this.MazeRatImagePath).then(function(texture){this.MazeRatTexture = texture}.bind(this));
        
        var promise = Promise.all(this.AllPromises)
        return promise
    }
    
    constructor2(){
        this.MazeScene = new THREE.Scene();
        this.MazeDebug = 0;
        this.MazeAutopilot = true;

        this.MazeRats = Math.ceil((this.MazeWidth*this.MazeDepth)/50);
        this.MazeSigns = Math.ceil((this.MazeWidth*this.MazeDepth)/50);
        this.MazeSpinners = Math.ceil((this.MazeWidth*this.MazeDepth)/50);
        this.MazeSpeed = 4;
        
        
        this.CreateActors();
        //this.UpdateWorldInterval = setInterval(this.UpdateWorld,10);
        
        this.MazeTurning = 0; //turning
        this.MazeMovement = 0; //going
        this.MazeFlipping = 0; //flipping
        this.MazeFlipped = 0; //flipped
        this.MazeGoQueue = 0; //presses for Go()
        this.MazeTurnQueue = 0; //presses for Turn()
        this.MazeOrientation = 'n'; //face
        
        //Creates the variable this.MazeRows which is an array of arrays of cells of the maze
        this.Maze = this.GenerateMaze(this.MazeWidth,this.MazeDepth);
        
        this.MazePosX = Math.round(this.MazeWidth/2);
        this.MazePosY = this.MazeDepth-1;
        
        this.MazeCamera = new THREE.PerspectiveCamera( 75, this.MazeResX/this.MazeResY, 1, 10000 );
        this.MazeCamera.position.z = -( (this.MazePosY*320) + (320)/2 ) //+ (320/2);
        this.MazeCamera.position.y = 100;
        this.MazeCamera.position.x = -( this.MazePosX*320 + (320/2));//-(this.MazeWidth*320)/2 - (320/2);
        this.MazeCamera.rotation.y = Math.radians(180);
        this.MazeCamera.far = 100;// Math.max(this.MazeWidth,this.MazeDepth)*320;

        this.MazeScene.add(this.MazeCamera);
        
        //CreateActors//
        this.PointLight = new THREE.PointLight(0xFFFFFF);
        this.PointLight.position.z = -( (this.MazePosY*320) + (320)/2 );
        this.PointLight.position.x = -( (this.MazePosX*320) + (320)/2 );
        this.MazeScene.add(this.PointLight);
        ///////////////
        
        
        //Crazy wall generation shenanigans
        var combinedWalls = new THREE.Geometry();
        
        var coolWalls = new THREE.Geometry();
        
        for(var y=0;y<this.MazeDepth;++y)
        {
            for(var x=0;x<this.MazeWidth;++x)
            {
        
                if(this.MazeRows[y][x].up)
                {
                    var mesh = new THREE.Mesh( new THREE.CubeGeometry(320, 200, 0, 0, 0, 0) );
                    mesh.position.x = -((x+1)*320) + (320/2);
                    mesh.position.y = 100;
                    mesh.position.z = -( y*320 )//(this.MazeDepth*320) - y;

                    if(Math.randomint(0,this.MazeWidth*this.MazeDepth))
                    {
                        THREE.GeometryUtils.merge( combinedWalls, mesh );
                    }
                    else
                    {
                        THREE.GeometryUtils.merge( coolWalls, mesh );
                    }

                }
                if(this.MazeRows[y][x].left)
                {
                    mesh = new THREE.Mesh( new THREE.CubeGeometry(0, 200, 320, 0, 0, 0) );
                    mesh.position.x = -((x)*320)// - (320/2);
                    mesh.position.y = 100;
                    mesh.position.z = -( ((y+1)*320) - (320/2) );//(this.MazeDepth*320) - y;
                    
                    if(Math.randomint(0,this.MazeWidth*this.MazeDepth))
                    {
                        THREE.GeometryUtils.merge( combinedWalls, mesh );
                    }
                    else
                    {
                        THREE.GeometryUtils.merge( coolWalls, mesh );
                    }
                }
                if(this.MazeRows[y][x].down && y==this.MazeDepth-1) //It only does this on the outside so that there aren't cloned walls all over
                {
                    mesh = new THREE.Mesh( new THREE.CubeGeometry(320, 200, 0, 0, 0, 0) );
                    mesh.position.x = -(((x+1)*320) - (320/2));
                    mesh.position.y = 100;
                    mesh.position.z = -( (y+1)*320 );//(this.MazeDepth*320) - y;

                    if(Math.randomint(0,this.MazeWidth*this.MazeDepth))
                    {
                        THREE.GeometryUtils.merge( combinedWalls, mesh );
                    }
                    else
                    {
                        THREE.GeometryUtils.merge( coolWalls, mesh );
                    }
                }
                if(this.MazeRows[y][x].right && x==this.MazeWidth-1) //Ditto
                {
                    mesh = new THREE.Mesh( new THREE.CubeGeometry(0, 200, 320, 0, 0, 0) );
                    mesh.position.x = -((x+1)*320)// - (320/2);
                    mesh.position.y = 100;
                    mesh.position.z = - ( ((y+1)*320) - (320/2) );//(this.MazeDepth*320) - y;

                    if(Math.randomint(0,this.MazeWidth*this.MazeDepth))
                    {
                        THREE.GeometryUtils.merge( combinedWalls, mesh );
                    }
                    else
                    {
                        THREE.GeometryUtils.merge( coolWalls, mesh );
                    }
                }    
            }
        }
        
        this.MazeWallsMesh = new THREE.Mesh(combinedWalls, new THREE.MeshBasicMaterial({map: this.MazeWallTexture}));
        this.MazeWallsMesh.scale.y = .05;
        this.MazeScene.add(this.MazeWallsMesh);
        this.MazeCoolWallsMesh = new THREE.Mesh( coolWalls, new THREE.MeshBasicMaterial({map: this.MazeGlobeTexture}));
        this.MazeCoolWallsMesh.scale.y = .05;
        this.MazeScene.add(this.MazeCoolWallsMesh);
        
        this.CreateFloor();
        this.CreateCeiling();
    
        this.UpdateWorldInterval = setInterval(this.UpdateWorld.bind(this),10);
        this.Animate();
    }
    
    
    //////////////Setup///////////////
    UpdateWorld(){
        if (this.MazeWallsMesh.scale.y < 1)
        {
            this.MazeWallsMesh.scale.y += .01;
            this.MazeCoolWallsMesh.scale.y += .01;
        }
        for(var i=0;i<this.MazeActors.length;++i)
        {
            this.MazeActors[i].tick();
            if(this.MazeActors[i].mesh.scale.y < this.MazeActors[i].sizeY)
            {
                this.MazeActors[i].mesh.scale.y += this.MazeActors[i].sizeY/100;
            }
        }
        this.PointLight.position.z = -( (this.MazePosY*320) + (320)/2 );
        this.PointLight.position.x = -( (this.MazePosX*320) + (320)/2 );
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
                                if(this.MazeDebug || !this.MazeRows[this.MazePosY][this.MazePosX].up)
                                {    
                                    this.MazePosY--;
                                    goInt = setInterval(function()
                                    {
                                        this.MazeMovement++;
                                        this.MazeCamera.position.z += this.MazeSpeed;
                                        if( this.MazeMovement>=320/this.MazeSpeed)
                                        {
                                            this.MazeMovement=0;
                                            this.MazeGoQueue = 0;
                                            clearInterval(goInt);
                                        }
                                    }.bind(this),1);
                                }
                                break;
                            case 's':
                                if(this.MazeDebug || !this.MazeRows[this.MazePosY][this.MazePosX].down)
                                {
                                    this.MazePosY++;
                                    var goInt = setInterval(function()
                                    {
                                        this.MazeMovement++;
                                        this.MazeCamera.position.z -= this.MazeSpeed;
                                        if( this.MazeMovement>=320/this.MazeSpeed)
                                        {
                                            this.MazeMovement=0;
                                            this.MazeGoQueue = 0;
                                            clearInterval(goInt);
                                        }
                                    }.bind(this),1);
                                }
                                break;
                            case 'w':
                                if(this.MazeDebug || !this.MazeRows[this.MazePosY][this.MazePosX].left)
                                {
                                    this.MazePosX--;
                                    var goInt = setInterval(function()
                                    {
                                        this.MazeMovement++;
                                        this.MazeCamera.position.x += this.MazeSpeed;
                                        if(this.MazeMovement>=320/this.MazeSpeed)
                                        {
                                            this.MazeMovement=0;
                                            this.MazeGoQueue = 0;
                                            clearInterval(goInt);
                                        }
                                    }.bind(this),1);
                                }
                                break;
                            case 'e':
                                if(this.MazeDebug || !this.MazeRows[this.MazePosY][this.MazePosX].right)
                                {
                                    this.MazePosX++;
                                    var goInt = setInterval(function()
                                    {
                                        this.MazeMovement++;
                                        this.MazeCamera.position.x -= this.MazeSpeed;
                                        if(this.MazeMovement>=320/this.MazeSpeed)
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
                                if(this.MazeDebug || !this.MazeRows[this.MazePosY][this.MazePosX].down)
                                {    
                                    this.MazePosY++;
                                    var goInt = setInterval(function()
                                    {
                                        this.MazeMovement++;
                                        this.MazeCamera.position.z -= this.MazeSpeed;
                                        if( this.MazeMovement>=320/this.MazeSpeed)
                                        {
                                            this.MazeMovement=0;
                                            this.MazeGoQueue = 0;
                                            clearInterval(goInt);
                                        }
                                    }.bind(this),1);
                                }
                                break;
                            case 's':
                                if(this.MazeDebug || !this.MazeRows[this.MazePosY][this.MazePosX].up)
                                {
                                    this.MazePosY--;
                                    var goInt = setInterval(function()
                                    {
                                        this.MazeMovement++;
                                        this.MazeCamera.position.z += this.MazeSpeed;
                                        if(this.MazeMovement>=320/this.MazeSpeed)
                                        {
                                            this.MazeMovement=0;
                                            this.MazeGoQueue = 0;
                                            clearInterval(goInt);
                                        }
                                    }.bind(this),1);
                                }
                                break;
                            case 'w':
                                if(this.MazeDebug || !this.MazeRows[this.MazePosY][this.MazePosX].right)
                                {
                                    this.MazePosX++;
                                    var goInt = setInterval(function()
                                    {
                                        this.MazeMovement++;
                                        this.MazeCamera.position.x -= this.MazeSpeed;
                                        if(this.MazeMovement>=320/this.MazeSpeed)
                                        {
                                            this.MazeMovement=0;
                                            this.MazeGoQueue = 0;
                                            clearInterval(goInt);
                                        }
                                    }.bind(this),1);
                                }
                                break;
                            case 'e':
                                if(this.MazeDebug || !this.MazeRows[this.MazePosY][this.MazePosX].left)
                                {
                                    this.MazePosX--;
                                    var goInt = setInterval(function()
                                    {
                                        this.MazeMovement++;
                                        this.MazeCamera.position.x += this.MazeSpeed;
                                        if(this.MazeMovement>=320/this.MazeSpeed)
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
    CreateFloor(){
        this.MazeFloorGeometry = new THREE.CubeGeometry(320*this.MazeWidth, 0, 320*this.MazeDepth, 1, 1, 1, null);
        this.MazeFloorTexture.wrapS = THREE.RepeatWrapping;
        this.MazeFloorTexture.wrapT = THREE.RepeatWrapping;
        this.MazeFloorTexture.offset.x = 0;
        this.MazeFloorTexture.offset.y = 0;
        this.MazeFloorTexture.repeat.x = (this.MazeWidth*320)/this.MazeFloorTexture.image.width;
        this.MazeFloorTexture.repeat.y = (this.MazeDepth*320)/this.MazeFloorTexture.image.height;
        this.MazeFloorMaterial = new THREE.MeshBasicMaterial({map: this.MazeFloorTexture});
        this.MazeFloorMesh = new THREE.Mesh(this.MazeFloorGeometry, this.MazeFloorMaterial);
        this.MazeFloorMesh.position.z = -(320*this.MazeDepth / 2);
        this.MazeFloorMesh.position.y = 0;
        this.MazeFloorMesh.position.x = -320*this.MazeWidth / 2;
        this.MazeScene.add(this.MazeFloorMesh);
    }
    
    CreateCeiling(){
        this.MazeCeilGeometry = new THREE.CubeGeometry(320*this.MazeWidth, 0, 320*this.MazeDepth, 1, 1, 1, null);
        this.MazeCeilTexture.wrapS = this.MazeCeilTexture.wrapT = THREE.RepeatWrapping;
        this.MazeCeilTexture.offset.x = 0;
        this.MazeCeilTexture.offset.y = 0;
        this.MazeCeilTexture.repeat.x = (this.MazeWidth*320)/this.MazeCeilTexture.image.width;
        this.MazeCeilTexture.repeat.y = (this.MazeDepth*320)/this.MazeCeilTexture.image.height;
        this.MazeCeilMaterial = new THREE.MeshBasicMaterial({map: this.MazeCeilTexture});
        this.MazeCeilMesh = new THREE.Mesh(this.MazeCeilGeometry, this.MazeCeilMaterial);
        this.MazeCeilMesh.position.z = -(320*this.MazeDepth / 2);
        this.MazeCeilMesh.position.y = 200;
        this.MazeCeilMesh.position.x = -320*this.MazeWidth / 2;
        this.MazeScene.add(this.MazeCeilMesh);
    }
    
    CreateActors(){
        this.MazeActors = new Array();
        this.CreateRatActors();
        this.LoadSignFont();
        this.CreateSpinnerActors();
        this.MazeActors.push(this.End(0,0));
    }

    CreateRatActors(){
        console.log(this.MazeRats);
        for(var i=0;i<this.MazeRats;++i)
        {
            var X = Math.randomint(0,this.MazeWidth-1);
            var Y = Math.randomint(0,this.MazeDepth-1);
            this.MazeActors.push(this.Rat(X,Y));
        }
    }

    LoadSignFont(){
        var loader = new THREE.FontLoader();
        loader.load(this.MazeOpenGLFontPath,
        function (font) {
            this.MazeOpenGLFont = font;
            this.CreateSignActors();
        }.bind(this));
    }

    CreateSignActors(){
        for(var i=0;i<this.MazeSigns;++i)
        {
            var X = Math.randomint(0,this.MazeWidth-1);
            var Y = Math.randomint(0,this.MazeDepth-1);
            this.MazeActors.push(this.OpenGLSign(X,Y));
        }
    }

    CreateSpinnerActors(){
        var takenSpinnerPlaces = new Array();
        
        for(var i=0;i<this.MazeSpinners;++i)
        {
            var bad=0;
            var X = Math.randomint(0,this.MazeWidth-1);
            var Y = Math.randomint(0,this.MazeDepth-2);
            
            for(var q=0;q<takenSpinnerPlaces.length;++q)
            {
                //alert(takenSpinnerPlaces[q][0] + " " + takenSpinnerPlaces[q][1] + "\n" + Y + " " + X)
                if(takenSpinnerPlaces[q][0]==Y && takenSpinnerPlaces[q][1]==X)
                {
                    bad=1;
                    //i--;
                }
            }
            if(!bad)
            {
                this.MazeActors.push(this.Spinner(X,Y));
                takenSpinnerPlaces.push(new Array);
                takenSpinnerPlaces[takenSpinnerPlaces.length-1][0] = Y;
                takenSpinnerPlaces[takenSpinnerPlaces.length-1][1] = X;
            }
        }
    }

    End(X,Y){
        var EndActor = new Actor(X,Y);
        EndActor.name="end";
        EndActor.mesh = new THREE.Mesh
        (
            new THREE.CubeGeometry( 100, 100, 0, 1, 1, 1, null),
            new THREE.MeshBasicMaterial({map: this.MazeEndTexture})
        )
        EndActor.mesh.material.transparent=true;
        //EndActor.posY = Y;
        //EndActor.posX = X;
        EndActor.mesh.position.z = -( (EndActor.posY*320) + (320)/2 );
        EndActor.mesh.position.x = -( (EndActor.posX*320) + (320)/2 );
        EndActor.mesh.position.y = 50;
        EndActor.mesh.scale.y = 0;
        EndActor.sizeY = 1;
        this.MazeScene.add(EndActor.mesh)
        EndActor.tick = function()
        {
            EndActor.mesh.rotation.y = this.MazeCamera.rotation.y;
            if(Math.abs(EndActor.mesh.position.z - this.MazeCamera.position.z) < 10 && Math.abs(EndActor.mesh.position.x - this.MazeCamera.position.x) < 10)
            {
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
            }
        }.bind(this);
        return EndActor;
    }

    OpenGLSign(X,Y){
        var SignActor = new Actor(X,Y);
        SignActor.mesh = new THREE.Mesh
        (
            new THREE.TextGeometry( "OpenGL",
            {
                size: 25,
                height: 10,
                curveSegments: 12,

                font: this.MazeOpenGLFont,
                weight: "bold",
                style: "bold",
            }),
            new THREE.MeshPhongMaterial( { color: 0x00ff00, specular: 0xffffff} )
        )
        //SignActor.posY = Y;
        //SignActor.posX = X;
        SignActor.mesh.position.z = -( (SignActor.posY*320) + (320)/2 - 50);
        SignActor.mesh.position.x = -( (SignActor.posX*320) + (320)/2 + 50);
        SignActor.mesh.position.y = 100;
        SignActor.mesh.scale.y = 0;
        SignActor.sizeY = 1;

        this.MazeScene.add(SignActor.mesh);
        
        SignActor.tick = function()
        {
            SignActor.mesh.rotation.y = this.MazeCamera.rotation.y;
        }.bind(this);
        return SignActor;
    }

    Rat(X,Y){
        var RatActor = new Actor(X,Y);
        RatActor.name="rat";
        RatActor.mesh = new THREE.Mesh
        (
            new THREE.CubeGeometry( 100, 50, 0, 1, 1, 1, null),
            new THREE.MeshBasicMaterial({map: this.MazeRatTexture})
        )
        
        RatActor.mesh.material.transparent=true;
        RatActor.mesh.scale.y = 0;
        RatActor.sizeY = 1;
        //RatActor.posY = Y;
        //RatActor.posX = X;
        RatActor.mesh.position.z = -( (RatActor.posY*320) + (320)/2 );
        RatActor.mesh.position.x = -( (RatActor.posX*320) + (320)/2 );
        RatActor.mesh.position.y = 50;
        
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
                        if(!this.MazeRows[RatActor.posY][RatActor.posX].up)
                        {
                            RatActor.posY--;
                            var that = RatActor;
                            RatActor.ratInterval = setInterval(function()
                            {
                                that.m++
                                that.mesh.position.z++;
                                if(that.m == 320)
                                {
                                    that.m=0;
                                    clearInterval(that.ratInterval);
                                }
                            },1);
                        }
                        break;
                    case 1:
                        if(!this.MazeRows[RatActor.posY][RatActor.posX].down && RatActor.posY>1)
                        {
                            RatActor.posY++;
                            var that = RatActor;
                            RatActor.ratInterval = setInterval(function()
                            {
                                that.m++
                                that.mesh.position.z--;
                                if(that.m == 320)
                                {
                                    that.m=0;
                                    clearInterval(that.ratInterval);
                                }
                            },1);
                        }
                        break;
                    case 2:
                        if(!this.MazeRows[RatActor.posY][RatActor.posX].right)
                        {
                            RatActor.posX++;
                            var that = RatActor;
                            RatActor.ratInterval = setInterval(function()
                            {
                                that.m++
                                that.mesh.position.x--;
                                if(that.m == 320)
                                {
                                    that.m=0;
                                    clearInterval(that.ratInterval);
                                }
                            },1);
                        }
                        break;
                    case 3:
                        if(!this.MazeRows[RatActor.posY][RatActor.posX].left)
                        {
                            RatActor.posX--;
                            var that = RatActor;
                            RatActor.ratInterval = setInterval(function()
                            {
                                that.m++
                                that.mesh.position.x++;
                                if(that.m == 320)
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

    Spinner(X,Y){
        var SpinnerActor = new Actor(X,Y);
        SpinnerActor.name="Spinner";
        
        SpinnerActor.mesh = new THREE.Mesh
        (
            new THREE.IcosahedronGeometry(),
            new THREE.MeshPhongMaterial({ color: 0xcccccc, specular: 0xffffff})
        )
        SpinnerActor.mesh.scale.x=50;
        SpinnerActor.mesh.scale.y=0;
        SpinnerActor.sizeY=50;
        SpinnerActor.mesh.scale.z=50;
        //SpinnerActor.posY = Y;
        //SpinnerActor.posX = X;

        SpinnerActor.mesh.position.z = -( (SpinnerActor.posY*320) + (320)/2 );
        SpinnerActor.mesh.position.x = -( (SpinnerActor.posX*320) + (320)/2 );
        SpinnerActor.mesh.position.y = 50;

        this.MazeScene.add(SpinnerActor.mesh)
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
    constructor(X,Y){
        this.posX = X;
        this.posY = Y;
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
