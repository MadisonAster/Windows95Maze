///////////Maze Generation////////
function windows95Maze(width,height){
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
    window.MazeRows = new Array();
    for(y=0;y<height;++y)
    {
        window.MazeRows[y] = new Array();
        for(x=0;x<width;++x)
        {
            window.MazeRows[y][x] = new Cell;
            if (!randint(0,10))
            {
                switch(randint(0,3))
                {
                    case 0:
                        window.MazeRows[y][x].up=2;
                        break;
                    case 1:
                        window.MazeRows[y][x].left=2;
                        break;
                    case 2:
                        window.MazeRows[y][x].right=2;
                        break;
                    default:
                        window.MazeRows[y][x].down=2;
                        break;
                }
            }
        }
    }

    function no_secluded_cells()
    {
        for(ya=0;ya<height;++ya)
        {
            for(xa=0;xa<width;++xa)
            {
                if(window.MazeRows[ya][xa].secluded())
                {
                    return 0
                }
            }
        }
        return 1
    }

    function connect_cells(y,x,y2,x2)
    {    try
        {
            if (window.MazeRows[y2][x2].secluded() /*&& x2>0*/ && x2<window.MazeRows[0].length /*&& y2 > 0*/ && y2 < window.MazeRows.length)
            {
                if (y<y2) //New Cell is below
                {
                    window.MazeRows[y2][x2].up=0;
                    window.MazeRows[y][x].down=0;
                }
                else if(y>y2) //New Cell is above
                {
                    window.MazeRows[y2][x2].down=0;
                    window.MazeRows[y][x].up=0;
                }
                else if(x<x2) //New Cell is right
                {
                    window.MazeRows[y2][x2].left=0;
                    window.MazeRows[y][x].right=0;
                }
                else if(x>x2) //New Cell is left
                {
                    window.MazeRows[y2][x2].right=0;
                    window.MazeRows[y][x].left=0;
                }
                return 1
            }
        }
        catch(err){}
        return 0;
    }

    function deadend(yb,xb)
    {
        if (yb > 0)
        {
            if (window.MazeRows[yb-1][xb].secluded())
            {
                return 0;
            }
        }
        if(yb < window.MazeRows.length-1)
        {
            if (window.MazeRows[yb+1][xb].secluded())
            {
                return 0;
            }
        }
        if(xb > 0)
        {
            if (window.MazeRows[yb][xb-1].secluded())
            {
                return 0;
            }
        }
        if( xb < window.MazeRows[0].length-1)
        {
            if (window.MazeRows[yb][xb+1].secluded())
            {
                return 0;
            }
        }
        
        return 1;
    }

    //Make the path
    var trail = new Array();
    var x = Math.round(width/2)-1;
    var y = height-1;
    var place=0;

    for (place=0;!no_secluded_cells();++place)
    {
        if(deadend(y,x))
        {
            y = trail[place-2][0];
            x = trail[place-2][1];
            place-=2;
        }
        else
        {
            var d = randint(1,4);
            switch(d) 
            {
                case 1: //left
                    if (connect_cells(y,x,y,x-1))
                    {
                        x--;
                        break;
                    }
                    else
                    {
                        d=2;
                    }
                case 2: //right
                    if (connect_cells(y,x,y,x+1))
                    {
                        x++;
                        break;
                    }
                    else
                    {
                        d=3;
                    }
                case 3: //up
                    if(connect_cells(y,x,y-1,x))
                    {
                        y--;
                        break;
                    }
                    else
                    {
                        d=4;
                    }
                case 4: //down
                    if(connect_cells(y,x,y+1,x))
                    {
                        y++;
                    }
                    else
                    {
                        d=5;
                    }
                    break;
                case 5: //left
                    if (connect_cells(y,x,y,x-1))
                    {
                        x--;
                        break;
                    }
                    else
                    {
                        d=6;
                    }
                case 6: //right
                    if (connect_cells(y,x,y,x+1))
                    {
                        x++;
                        break;
                    }
                    else
                    {
                        d=7;
                    }
                case 7: //up
                    if(connect_cells(y,x,y-1,x))
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
    rax = randint(0,width-1);
    ray = randint(0,height-1);
    
    switch( window.MazeRows[ray][rax] )
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
//////////////////////////////////

/////////////Actors///////////////
function createActors(){
    actors = new Array();
    createRatActors();
    LoadSignFont();
    createSpinnerActors();
    actors.push(new End(0,0));
    //alert(actors[1].posY + " " + actors[1].posX + "\n" + actors[2].posY + " " + actors[2].posX)
}

function createRatActors(){
    for(i=0;i<window.MazeRats;++i)
    {
        Y = randint(0,window.MazeDepth-1);
        X = randint(0,window.MazeWidth-1);
        actors.push(new Rat(Y,X));
    }
}

function LoadSignFont(){
    var loader = new THREE.FontLoader();
    loader.load('droid_serif_bold.typeface.json',
    function (font) {
        window.SignFont = font;
        createSignActors();
    });
}

function createSignActors(){
    for(i=0;i<window.MazeSigns;++i)
    {
        Y = randint(0,window.MazeDepth-1);
        X = randint(0,window.MazeWidth-1);
        actors.push(new OpenGL(Y,X));
    }
}

function createSpinnerActors(){
    takenSpinnerPlaces = new Array();
    
    for(i=0;i<window.MazeSpinners;++i)
    {
        bad=0;
        Y = randint(0,window.MazeDepth-2);
        X = randint(0,window.MazeWidth-1);
        
        for(q=0;q<takenSpinnerPlaces.length;++q)
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
            actors.push(new Spinner(Y,X));
            takenSpinnerPlaces.push(new Array);
            takenSpinnerPlaces[takenSpinnerPlaces.length-1][0] = Y;
            takenSpinnerPlaces[takenSpinnerPlaces.length-1][1] = X;
        }
    }
}

function End(Y,X){
    this.name="end";
    this.mesh = new THREE.Mesh
    (
        new THREE.CubeGeometry( 100, 100, 0, 1, 1, 1, null),
        new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("cool.png") })
    )
    this.mesh.material.transparent=true;
    this.posY = Y;
    this.posX = X;
    this.mesh.position.z = -( (this.posY*320) + (320)/2 );
    this.mesh.position.x = -( (this.posX*320) + (320)/2 );
    this.mesh.position.y = 50;
    this.mesh.scale.y = 0;
    this.sizeY = 1;
    window.MazeScene.add(this.mesh)
    this.tick = function()
    {
        this.mesh.rotation.y = window.MazeCamera.rotation.y;
        if(difference(this.mesh.position.z,window.MazeCamera.position.z) < 10 && difference(this.mesh.position.x,window.MazeCamera.position.x) < 10)
        {
            that=this;
            endInterval = setInterval(function()
            {
                if (wallsMesh.scale.y > 0)
                {
                    wallsMesh.scale.y -= .01;
                    coolWallsMesh.scale.y -= .01;
                    for(i=0;i<actors.length-1;++i)
                    {
                        actors[i].mesh.scale.y -= .01;
                    }
                }
                else
                {
                    //if(!window.MazeEnded)
                    //{
                    //    window.location = "./?w="+(parseInt(window.MazeWidth)+1)+"&h="+(parseInt(window.MazeDepth)+1)+"&c="+window.MazeCeilImage+"&f="+window.MazeFloorImage+"&wa="+window.MazeWallImage;
                    //    window.MazeEnded = 1;
                    //}
                    clearInterval(endInterval);
                    
                    init();
                    //clearInterval(updateWorld);
                }
            },10);
        }
    }
}

function OpenGL(Y,X){
    this.mesh = new THREE.Mesh
    (
        new THREE.TextGeometry( "OpenGL",
        {
            size: 25,
            height: 10,
            curveSegments: 12,

            font: window.SignFont,
            weight: "bold",
            style: "bold",
        }),
        new THREE.MeshPhongMaterial( { color: 0x00ff00, specular: 0xffffff} )
    )
    this.posY = Y;
    this.posX = X;
    this.mesh.position.z = -( (this.posY*320) + (320)/2 - 50);
    this.mesh.position.x = -( (this.posX*320) + (320)/2 + 50);
    this.mesh.position.y = 100;
    this.mesh.scale.y = 0;
    this.sizeY = 1;

    window.MazeScene.add(this.mesh);
    
    this.tick = function()
    {
        this.mesh.rotation.y = window.MazeCamera.rotation.y;
    }
    
}

function Rat(Y,X){
    this.name="rat";
    this.mesh = new THREE.Mesh
    (
        new THREE.CubeGeometry( 100, 50, 0, 1, 1, 1, null),
        new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("rat2.png") })
    )
    
    this.mesh.material.transparent=true;
    this.mesh.scale.y = 0;
    this.sizeY = 1;
    this.posY = Y;
    this.posX = X;
    this.mesh.position.z = -( (this.posY*320) + (320)/2 );
    this.mesh.position.x = -( (this.posX*320) + (320)/2 );
    this.mesh.position.y = 50;
    
    window.MazeScene.add(this.mesh);
    this.m=0;
    
    this.tick = function()
    {
        //return;
        this.mesh.rotation.y = window.MazeCamera.rotation.y;
        if(!this.m)
        {
            var randey = randint(0,3);
            switch(randey)
            {
                case 0:
                    if(!window.MazeRows[this.posY][this.posX].up)
                    {
                        this.posY--;
                        var that = this;
                        this.ratInterval = setInterval(function()
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
                    if(!window.MazeRows[this.posY][this.posX].down && this.posY>1)
                    {
                        this.posY++;
                        var that = this;
                        this.ratInterval = setInterval(function()
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
                    if(!window.MazeRows[this.posY][this.posX].right)
                    {
                        this.posX++;
                        var that = this;
                        this.ratInterval = setInterval(function()
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
                    if(!window.MazeRows[this.posY][this.posX].left)
                    {
                        this.posX--;
                        var that = this;
                        this.ratInterval = setInterval(function()
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
    }
}

function Spinner(Y,X){
    this.name="Spinner";
    
    this.mesh = new THREE.Mesh
    (
        new THREE.IcosahedronGeometry(),
        new THREE.MeshPhongMaterial({ color: 0xcccccc, specular: 0xffffff})
    )
    this.mesh.scale.x=50;
    this.mesh.scale.y=0;
    this.sizeY=50;
    this.mesh.scale.z=50;
    this.posY = Y;
    this.posX = X;

    this.mesh.position.z = -( (this.posY*320) + (320)/2 );
    this.mesh.position.x = -( (this.posX*320) + (320)/2 );
    this.mesh.position.y = 50;

    window.MazeScene.add(this.mesh)
    this.tick = function()
    {
        this.mesh.rotation.y += rad(1);
        if(difference(this.mesh.position.z,window.MazeCamera.position.z) < 10 && difference(this.mesh.position.x,window.MazeCamera.position.x) < 10)
        {
            flip();
            this.mesh.scale.x=0;
            this.mesh.scale.y=0;
            this.mesh.scale.z=0;
            this.tick = function(){return 0}
        }
    }
}
//////////////////////////////////

/////////////Animation////////////
function flip(){
    if(!window.MazeFlipping)
    {
        flipInt = setInterval(function()
        {
            window.MazeFlipping++;
            window.MazeCamera.rotation.z -= rad(1);
            if(window.MazeFlipping==180)
            {
                window.MazeFlipping = 0;
                window.MazeFlipped = !window.MazeFlipped;
                clearInterval(flipInt);
            }
        },5);
    }
}

function turn(d){
    if(!window.MazeTurning)
    {
        window.MazeTurnQueue++;
        //if(window.MazeTurnQueue<2) this fixes the infinite spin bug but makes the controls suck
        {
            if (d == 'l' && window.MazeFlipped || d == 'r' && !window.MazeFlipped)
            {
                switch(window.MazeOrientation)
                {
                    case 'n':
                        window.MazeOrientation = 'e';
                        break;
                    case 'e':
                        window.MazeOrientation = 's';
                        break;
                    case 's':
                        window.MazeOrientation = 'w';
                        break;
                    case 'w':
                        window.MazeOrientation = 'n';
                        break;
                }
                turnInt = setInterval(function()
                {
                    window.MazeTurning++;
                    window.MazeCamera.rotation.y -= rad(1);
                    if(window.MazeTurning==90)
                    {
                        window.MazeTurning=0;
                        clearInterval(turnInt);
                    }
                },1);
            } else {
                switch(window.MazeOrientation)
                {
                    case 'n':
                        window.MazeOrientation = 'w';
                        break;
                    case 'w':
                        window.MazeOrientation = 's';
                        break;
                    case 's':
                        window.MazeOrientation = 'e';
                        break;
                    case 'e':
                        window.MazeOrientation = 'n';
                        break;
                }
                turnInt = setInterval(function()
                {
                    window.MazeTurning++;
                    window.MazeCamera.rotation.y += rad(1);
                    if(window.MazeTurning==90)
                    {
                        window.MazeTurning=0;
                        clearInterval(turnInt);
                    }
                },5);
            }
        }
        //else
        {
            window.MazeTurnQueue=0;
        }
    }
}

function go(d){
    //I have a feeling this might be able to be simplified a bit 
    if(!window.MazeMovement)
    {
        window.MazeGoQueue++;
        //if(window.MazeGoQueue<2)
        {
            switch(d)
            {
                case 'f':
                {
                    switch(window.MazeOrientation)
                    {
                        case 'n':
                            if(window.MazeDebug || !window.MazeRows[window.MazePosY][window.MazePosX].up)
                            {    
                                window.MazePosY--;
                                goInt = setInterval(function()
                                {
                                    window.MazeMovement++;
                                    window.MazeCamera.position.z += window.MazeSpeed;
                                    if( window.MazeMovement>=320/window.MazeSpeed)
                                    {
                                        window.MazeMovement=0;
                                        window.MazeGoQueue = 0;
                                        clearInterval(goInt);
                                    }
                                },1);
                            }
                            break;
                        case 's':
                            if(window.MazeDebug || !window.MazeRows[window.MazePosY][window.MazePosX].down)
                            {
                                window.MazePosY++;
                                goInt = setInterval(function()
                                {
                                    window.MazeMovement++;
                                    window.MazeCamera.position.z -= window.MazeSpeed;
                                    if( window.MazeMovement>=320/window.MazeSpeed)
                                    {
                                        window.MazeMovement=0;
                                        window.MazeGoQueue = 0;
                                        clearInterval(goInt);
                                    }
                                },1);
                            }
                            break;
                        case 'w':
                            if(window.MazeDebug || !window.MazeRows[window.MazePosY][window.MazePosX].left)
                            {
                                window.MazePosX--;
                                goInt = setInterval(function()
                                {
                                    window.MazeMovement++;
                                    window.MazeCamera.position.x += window.MazeSpeed;
                                    if( window.MazeMovement>=320/window.MazeSpeed)
                                    {
                                        window.MazeMovement=0;
                                        window.MazeGoQueue = 0;
                                        clearInterval(goInt);
                                    }
                                },1);
                            }
                            break;
                        case 'e':
                            if(window.MazeDebug || !window.MazeRows[window.MazePosY][window.MazePosX].right)
                            {
                                window.MazePosX++;
                                goInt = setInterval(function()
                                {
                                    window.MazeMovement++;
                                    window.MazeCamera.position.x -= window.MazeSpeed;
                                    if( window.MazeMovement>=320/window.MazeSpeed)
                                    {
                                        window.MazeMovement=0;
                                        window.MazeGoQueue = 0;
                                        clearInterval(goInt);
                                    }
                                },1);
                            }
                            break;
                        default:
                            window.MazeMovement=0;
                            window.MazeGoQueue = 0;
                    }
                    break;
                }
                case 'b':
                {
                    switch(window.MazeOrientation)
                    {
                        case 'n':
                            if(window.MazeDebug || !window.MazeRows[window.MazePosY][window.MazePosX].down)
                            {    
                                window.MazePosY++;
                                goInt = setInterval(function()
                                {
                                    window.MazeMovement++;
                                    window.MazeCamera.position.z -= window.MazeSpeed;
                                    if( window.MazeMovement>=320/window.MazeSpeed)
                                    {
                                        window.MazeMovement=0;
                                        window.MazeGoQueue = 0;
                                        clearInterval(goInt);
                                    }
                                },1);
                            }
                            break;
                        case 's':
                            if(window.MazeDebug || !window.MazeRows[window.MazePosY][window.MazePosX].up)
                            {
                                window.MazePosY--;
                                goInt = setInterval(function()
                                {
                                    window.MazeMovement++;
                                    window.MazeCamera.position.z += window.MazeSpeed;
                                    if( window.MazeMovement>=320/window.MazeSpeed)
                                    {
                                        window.MazeMovement=0;
                                        window.MazeGoQueue = 0;
                                        clearInterval(goInt);
                                    }
                                },1);
                            }
                            break;
                        case 'w':
                            if(window.MazeDebug || !window.MazeRows[window.MazePosY][window.MazePosX].right)
                            {
                                window.MazePosX++;
                                goInt = setInterval(function()
                                {
                                    window.MazeMovement++;
                                    window.MazeCamera.position.x -= window.MazeSpeed;
                                    if( window.MazeMovement>=320/window.MazeSpeed)
                                    {
                                        window.MazeMovement=0;
                                        window.MazeGoQueue = 0;
                                        clearInterval(goInt);
                                    }
                                },1);
                            }
                            break;
                        case 'e':
                            if(window.MazeDebug || !window.MazeRows[window.MazePosY][window.MazePosX].left)
                            {
                                window.MazePosX--;
                                goInt = setInterval(function()
                                {
                                    window.MazeMovement++;
                                    window.MazeCamera.position.x += window.MazeSpeed;
                                    if( window.MazeMovement>=320/window.MazeSpeed)
                                    {
                                        window.MazeMovement=0;
                                        window.MazeGoQueue = 0;
                                        clearInterval(goInt);
                                    }
                                },1);
                            }
                            break;
                    }
                }
            }
        }
        //else
        {
            window.MazeGoQueue = 0;
        }
    }
}
//////////////////////////////////

///////////Generic Stuff//////////
function randint(min,max){ 
    return Math.floor(Math.random()*(max-min+1))+min
}

function forInRange(start,end,variable,code){
    eval(variable+"="+start+";for("+variable+"=start;"+variable+"<end;"+variable+"++){code()}");
}

function greater(a,b){
    (a>b) ? c=a : c=b;
    return c;
}

function lesser(a,b){
    (a<b) ? c=a : c=b;
    return c;
}

function difference(a,b){
    return greater(a,b) - lesser(a,b);
}

function rad(n){
    return n*(Math.PI/180);
}

function getImgSize(imgSrc){
    var newImg = new Image();
    newImg.src = imgSrc;
    return[newImg.width,newImg.height];
}
//////////////////////////////////

//////////////Unsorted////////////
function ResizeHandling(){
    window.MazeRenderer.setSize( window.innerWidth, window.innerHeight );
    //init();animate();
}

function KeyHandling(event){
        switch(event.keyCode)
        {
            case 87: //w
            case 38: //Up
                go('f');
                break;
            case 65: //a
            case 37: //Left
                turn('l');
                break;
            case 83: //s
            case 40: //Down
                go('b');
                break;
            case 68: //d
            case 39: //Right
                turn('r');
                break;
        }
};

function UpdateWorld(){
    if (wallsMesh.scale.y < 1)
    {
        wallsMesh.scale.y += .01;
        coolWallsMesh.scale.y += .01;
    }
    for(i=0;i<actors.length;++i)
    {
        actors[i].tick();
        if(actors[i].mesh.scale.y < actors[i].sizeY)
        {
            actors[i].mesh.scale.y += actors[i].sizeY/100;
        }
    }
    pointLight.position.z = -( (window.MazePosY*320) + (320)/2 );
    pointLight.position.x = -( (window.MazePosX*320) + (320)/2 );
};
//////////////////////////////////

//////////////Main()//////////////
function init(){
    window.MazeScene = new THREE.Scene();

    window.MazeDebug = 0;
    window.MazeAutopilot = true;

    window.MazeWidth = 12;
    window.MazeDepth = 12;
    window.MazeWallImage = "wall.png";
    window.MazeCeilImage = "ceiling.png";
    window.MazeFloorImage = "floor.png";
    window.MazeRats = Math.ceil((window.MazeWidth*window.MazeDepth)/50);
    window.MazeSigns = Math.ceil((window.MazeWidth*window.MazeDepth)/50);
    window.MazeSpinners = Math.ceil((window.MazeWidth*window.MazeDepth)/50);
    window.MazeSpeed = 4;

    createActors();
    $(window).resize(ResizeHandling);
    $(window).keydown(KeyHandling);
    updateWorld = setInterval(UpdateWorld,10);
    
    window.MazeTurning = 0; //turning
    window.MazeMovement = 0; //going
    window.MazeFlipping = 0; //flipping
    window.MazeFlipped = 0; //flipped
    window.MazeGoQueue = 0; //presses for go()
    window.MazeTurnQueue = 0; //presses for turn()
    window.MazeOrientation = 'n'; //face
    
    //Creates the variable window.MazeRows which is an array of arrays of cells of the maze
    windows95Maze(window.MazeWidth,window.MazeDepth);
    
    window.MazePosX = Math.round(window.MazeWidth/2);
    window.MazePosY = window.MazeDepth-1;
    
    window.MazeCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    window.MazeCamera.position.z = -( (window.MazePosY*320) + (320)/2 ) //+ (320/2);
    window.MazeCamera.position.y = 100;
    window.MazeCamera.position.x = -( window.MazePosX*320 + (320/2));//-(window.MazeWidth*320)/2 - (320/2);
    window.MazeCamera.rotation.y = rad(180);
    window.MazeCamera.far = 100;// greater(window.MazeWidth,window.MazeDepth)*320;

    window.MazeScene.add( window.MazeCamera );
    
    pointLight = new THREE.PointLight( 0xFFFFFF );
    pointLight.position.z = -( (window.MazePosY*320) + (320)/2 );
    pointLight.position.x = -( (window.MazePosX*320) + (320)/2 );

    window.MazeScene.add(pointLight)
    
    
    var floorImg = new Image();
    floorImg.src = window.MazeFloorImage;

    floorImg.onload = function()
    {
        var floorGeometry = new THREE.CubeGeometry( 320*window.MazeWidth, 0, 320*window.MazeDepth, 1, 1, 1, null);
        var floorTexture = THREE.ImageUtils.loadTexture(window.MazeFloorImage);
        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.offset.x = 0;
        floorTexture.offset.y = 0;
        floorTexture.repeat.x = (window.MazeWidth*320)/this.width;
        floorTexture.repeat.y = (window.MazeDepth*320)/this.height;
        var floorMaterial = new THREE.MeshBasicMaterial({map: floorTexture });
        floorMesh = new THREE.Mesh( floorGeometry, floorMaterial );
        floorMesh.position.z = -( 320*window.MazeDepth / 2 );
        floorMesh.position.y = 0;
        floorMesh.position.x = -320*window.MazeWidth / 2;
        
        window.MazeScene.add(floorMesh);
    }
    
    //Crazy wall generation shenanigans
    var combinedWalls = new THREE.Geometry();
    
    var coolWalls = new THREE.Geometry();
    
    for(y=0;y<window.MazeDepth;++y)
    {
        for(x=0;x<window.MazeWidth;++x)
        {
    
            if(window.MazeRows[y][x].up)
            {
                mesh = new THREE.Mesh( new THREE.CubeGeometry(320, 200, 0, 0, 0, 0) );
                mesh.position.x = -((x+1)*320) + (320/2);
                mesh.position.y = 100;
                mesh.position.z = -( y*320 )//(window.MazeDepth*320) - y;

                if(randint(0,window.MazeWidth*window.MazeDepth))
                {
                    THREE.GeometryUtils.merge( combinedWalls, mesh );
                }
                else
                {
                    THREE.GeometryUtils.merge( coolWalls, mesh );
                }

            }
            if(window.MazeRows[y][x].left)
            {
                mesh = new THREE.Mesh( new THREE.CubeGeometry(0, 200, 320, 0, 0, 0) );
                mesh.position.x = -((x)*320)// - (320/2);
                mesh.position.y = 100;
                mesh.position.z = -( ((y+1)*320) - (320/2) );//(window.MazeDepth*320) - y;
                
                if(randint(0,window.MazeWidth*window.MazeDepth))
                {
                    THREE.GeometryUtils.merge( combinedWalls, mesh );
                }
                else
                {
                    THREE.GeometryUtils.merge( coolWalls, mesh );
                }
            }
            if(window.MazeRows[y][x].down && y==window.MazeDepth-1) //It only does this on the outside so that there aren't cloned walls all over
            {
                mesh = new THREE.Mesh( new THREE.CubeGeometry(320, 200, 0, 0, 0, 0) );
                mesh.position.x = -(((x+1)*320) - (320/2));
                mesh.position.y = 100;
                mesh.position.z = -( (y+1)*320 );//(window.MazeDepth*320) - y;

                if(randint(0,window.MazeWidth*window.MazeDepth))
                {
                    THREE.GeometryUtils.merge( combinedWalls, mesh );
                }
                else
                {
                    THREE.GeometryUtils.merge( coolWalls, mesh );
                }
            }
            if(window.MazeRows[y][x].right && x==window.MazeWidth-1) //Ditto
            {
                mesh = new THREE.Mesh( new THREE.CubeGeometry(0, 200, 320, 0, 0, 0) );
                mesh.position.x = -((x+1)*320)// - (320/2);
                mesh.position.y = 100;
                mesh.position.z = - ( ((y+1)*320) - (320/2) );//(window.MazeDepth*320) - y;

                if(randint(0,window.MazeWidth*window.MazeDepth))
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
    
    wallsMesh = new THREE.Mesh(combinedWalls, new THREE.MeshBasicMaterial({map: new THREE.ImageUtils.loadTexture(window.MazeWallImage)}));
    
    wallsMesh.scale.y = .05;
    
    window.MazeScene.add(wallsMesh);
    
    coolWallsMesh = new THREE.Mesh( coolWalls, new THREE.MeshBasicMaterial({map: new THREE.ImageUtils.loadTexture("globe.png")}));
    
    coolWallsMesh.scale.y = .05;
    
    window.MazeScene.add( coolWallsMesh );
    
    var ceilImg = new Image();
    ceilImg.src = window.MazeCeilImage;

    ceilImg.onload = function()
    {
        var ceilGeometry = new THREE.CubeGeometry( 320*window.MazeWidth, 0, 320*window.MazeDepth, 1, 1, 1, null);
        var ceilTexture = THREE.ImageUtils.loadTexture(window.MazeCeilImage);
        ceilTexture.wrapS = ceilTexture.wrapT = THREE.RepeatWrapping;
        ceilTexture.offset.x = 0;
        ceilTexture.offset.y = 0;
        ceilTexture.repeat.x = (window.MazeWidth*320)/this.width;
        ceilTexture.repeat.y = (window.MazeDepth*320)/this.height;
        var ceilMaterial = new THREE.MeshBasicMaterial({map: ceilTexture});
        ceilMesh = new THREE.Mesh( ceilGeometry, ceilMaterial );
        ceilMesh.position.z = -( 320*window.MazeDepth / 2 );
        ceilMesh.position.y = 200;
        ceilMesh.position.x = -320*window.MazeWidth / 2;
        window.MazeScene.add(ceilMesh);
    }
    
    try
    {
        window.MazeRenderer = new THREE.WebGLRenderer();
        window.MazeRenderer.setSize( window.innerWidth, window.innerHeight );

        document.body.appendChild( window.MazeRenderer.domElement );
    }
    catch(err)
    {
        alert("WebGL couldn't start! Make sure you're using a supported browser and graphics card and that your graphics card's drivers are up to date.");
    }

}

function animate(){
    requestAnimationFrame(animate);
    render();
}

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

function render(){
    window.MazeRenderer.render(window.MazeScene, window.MazeCamera);
}
//////////////////////////////////