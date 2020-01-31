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
    $.rows = new Array();
    for(y=0;y<height;++y)
    {
        $.rows[y] = new Array();
        for(x=0;x<width;++x)
        {
            $.rows[y][x] = new Cell;
            if (!randint(0,10))
            {
                switch(randint(0,3))
                {
                    case 0:
                        $.rows[y][x].up=2;
                        break;
                    case 1:
                        $.rows[y][x].left=2;
                        break;
                    case 2:
                        $.rows[y][x].right=2;
                        break;
                    default:
                        $.rows[y][x].down=2;
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
                if($.rows[ya][xa].secluded())
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
            if ($.rows[y2][x2].secluded() /*&& x2>0*/ && x2<$.rows[0].length /*&& y2 > 0*/ && y2 < $.rows.length)
            {
                if (y<y2) //New Cell is below
                {
                    $.rows[y2][x2].up=0;
                    $.rows[y][x].down=0;
                }
                else if(y>y2) //New Cell is above
                {
                    $.rows[y2][x2].down=0;
                    $.rows[y][x].up=0;
                }
                else if(x<x2) //New Cell is right
                {
                    $.rows[y2][x2].left=0;
                    $.rows[y][x].right=0;
                }
                else if(x>x2) //New Cell is left
                {
                    $.rows[y2][x2].right=0;
                    $.rows[y][x].left=0;
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
            if ($.rows[yb-1][xb].secluded())
            {
                return 0;
            }
        }
        if(yb < $.rows.length-1)
        {
            if ($.rows[yb+1][xb].secluded())
            {
                return 0;
            }
        }
        if(xb > 0)
        {
            if ($.rows[yb][xb-1].secluded())
            {
                return 0;
            }
        }
        if( xb < $.rows[0].length-1)
        {
            if ($.rows[yb][xb+1].secluded())
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
    
    switch( $.rows[ray][rax] )
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
    for(i=0;i<$.rats;++i)
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
    for(i=0;i<$.openglsigns;++i)
    {
        Y = randint(0,window.MazeDepth-1);
        X = randint(0,window.MazeWidth-1);
        actors.push(new OpenGL(Y,X));
    }
}

function createSpinnerActors(){
    $.takenSpinnerPlaces = new Array();
    
    for(i=0;i<$.spinners;++i)
    {
        $.bad=0;
        Y = randint(0,window.MazeDepth-2);
        X = randint(0,window.MazeWidth-1);
        
        for(q=0;q<$.takenSpinnerPlaces.length;++q)
        {
            //alert($.takenSpinnerPlaces[q][0] + " " + $.takenSpinnerPlaces[q][1] + "\n" + Y + " " + X)
            if($.takenSpinnerPlaces[q][0]==Y && $.takenSpinnerPlaces[q][1]==X)
            {
                $.bad=1;
                //i--;
            }
        }
        if(!$.bad)
        {
            actors.push(new Spinner(Y,X));
            $.takenSpinnerPlaces.push(new Array);
            $.takenSpinnerPlaces[$.takenSpinnerPlaces.length-1][0] = Y;
            $.takenSpinnerPlaces[$.takenSpinnerPlaces.length-1][1] = X;
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
                    //if(!$.ended)
                    //{
                    //    window.location = "./?w="+(parseInt(window.MazeWidth)+1)+"&h="+(parseInt(window.MazeDepth)+1)+"&c="+$.ceilImage+"&f="+$.floorImage+"&wa="+$.wallImage;
                    //    $.ended=1;
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
    //this.mesh.scale.y = 0;

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
                    if(!$.rows[this.posY][this.posX].up)
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
                    if(!$.rows[this.posY][this.posX].down && this.posY>1)
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
                    if(!$.rows[this.posY][this.posX].right)
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
                    if(!$.rows[this.posY][this.posX].left)
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
    this.mesh.scale.y=50;
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
    if(!$.f)
    {
        flipInt = setInterval(function()
        {
            $.f++;
            window.MazeCamera.rotation.z -= rad(1);
            if($.f==180)
            {
                $.f=0;
                clearInterval(flipInt);
            }
        },5);
    }
}

function turn(d){
    if(!$.t)
    {
        $.p2++;
        //if($.p2<2) this fixes the infinite spin bug but makes the controls suck
        {
            switch(d)
            {
                case 'l':
                    switch(face)
                    {
                        case 'n':
                            face = 'w';
                            break;
                        case 'w':
                            face = 's';
                            break;
                        case 's':
                            face = 'e';
                            break;
                        case 'e':
                            face = 'n';
                            break;
                    }
                    turnInt = setInterval(function()
                    {
                        $.t++;
                        window.MazeCamera.rotation.y += rad(1);
                        if($.t==90)
                        {
                            $.t=0;
                            clearInterval(turnInt);
                        }
                    },1);
                    break;
                case 'r':
                    switch(face)
                    {
                        case 'n':
                            face = 'e';
                            break;
                        case 'e':
                            face = 's';
                            break;
                        case 's':
                            face = 'w';
                            break;
                        case 'w':
                            face = 'n';
                            break;
                    }
                    turnInt = setInterval(function()
                    {
                        $.t++;
                        window.MazeCamera.rotation.y -= rad(1);
                        if($.t==90)
                        {
                            $.t=0;
                            clearInterval(turnInt);
                        }
                    },5);
                    break;
            }
        }
        //else
        {
            $.p2=0;
        }
    }
}

function go(d){
    //I have a feeling this might be able to be simplified a bit 
    if(!$.g)
    {
        $.p++;
        //if($.p<2)
        {
            switch(d)
            {
                case 'f':
                {
                    switch(face)
                    {
                        case 'n':
                            if(window.MazeDebug || !$.rows[$.posY][$.posX].up)
                            {    
                                $.posY--;
                                goInt = setInterval(function()
                                {
                                    $.g++;
                                    window.MazeCamera.position.z += $.speed;
                                    if( $.g>=320/$.speed)
                                    {
                                        $.g=0;
                                        $.p=0;
                                        clearInterval(goInt);
                                    }
                                },1);
                            }
                            break;
                        case 's':
                            if(window.MazeDebug || !$.rows[$.posY][$.posX].down)
                            {
                                $.posY++;
                                goInt = setInterval(function()
                                {
                                    $.g++;
                                    window.MazeCamera.position.z -= $.speed;
                                    if( $.g>=320/$.speed)
                                    {
                                        $.g=0;
                                        $.p=0;
                                        clearInterval(goInt);
                                    }
                                },1);
                            }
                            break;
                        case 'w':
                            if(window.MazeDebug || !$.rows[$.posY][$.posX].left)
                            {
                                $.posX--;
                                goInt = setInterval(function()
                                {
                                    $.g++;
                                    window.MazeCamera.position.x += $.speed;
                                    if( $.g>=320/$.speed)
                                    {
                                        $.g=0;
                                        $.p=0;
                                        clearInterval(goInt);
                                    }
                                },1);
                            }
                            break;
                        case 'e':
                            if(window.MazeDebug || !$.rows[$.posY][$.posX].right)
                            {
                                $.posX++;
                                goInt = setInterval(function()
                                {
                                    $.g++;
                                    window.MazeCamera.position.x -= $.speed;
                                    if( $.g>=320/$.speed)
                                    {
                                        $.g=0;
                                        $.p=0;
                                        clearInterval(goInt);
                                    }
                                },1);
                            }
                            break;
                        default:
                            $.g=0;$.p=0;
                    }
                    break;
                }
                case 'b':
                {
                    switch(face)
                    {
                        case 'n':
                            if(window.MazeDebug || !$.rows[$.posY][$.posX].down)
                            {    
                                $.posY++;
                                goInt = setInterval(function()
                                {
                                    $.g++;
                                    window.MazeCamera.position.z -= $.speed;
                                    if( $.g>=320/$.speed)
                                    {
                                        $.g=0;
                                        $.p=0;
                                        clearInterval(goInt);
                                    }
                                },1);
                            }
                            break;
                        case 's':
                            if(window.MazeDebug || !$.rows[$.posY][$.posX].up)
                            {
                                $.posY--;
                                goInt = setInterval(function()
                                {
                                    $.g++;
                                    window.MazeCamera.position.z += $.speed;
                                    if( $.g>=320/$.speed)
                                    {
                                        $.g=0;
                                        $.p=0;
                                        clearInterval(goInt);
                                    }
                                },1);
                            }
                            break;
                        case 'w':
                            if(window.MazeDebug || !$.rows[$.posY][$.posX].right)
                            {
                                $.posX++;
                                goInt = setInterval(function()
                                {
                                    $.g++;
                                    window.MazeCamera.position.x -= $.speed;
                                    if( $.g>=320/$.speed)
                                    {
                                        $.g=0;
                                        $.p=0;
                                        clearInterval(goInt);
                                    }
                                },1);
                            }
                            break;
                        case 'e':
                            if(window.MazeDebug || !$.rows[$.posY][$.posX].left)
                            {
                                $.posX--;
                                goInt = setInterval(function()
                                {
                                    $.g++;
                                    window.MazeCamera.position.x += $.speed;
                                    if( $.g>=320/$.speed)
                                    {
                                        $.g=0;
                                        $.p=0;
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
            $.p=0;
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
    //try
    //{
        switch(event.keyCode)
        {
            case 87: //w
                go('f');
                break;
            case 65: //a
                turn('l');
                break;
            case 83: //s
                go('b');
                break;
            case 68: //d
                turn('r');
                break;
            case 38: //Up
                go('f');
                break;
            case 37: //Left
                turn('l');
                break;
            case 40: //Down
                go('b');
                break;
            case 39: //Right
                turn('r');
                break;
        }
    //}
    //catch(err){}
};

function MouseUpdate(e){
    $.mouseX = e.pageX; 
    $.mouseY = e.pageY;
};

function UpdateWorld(){
    //if($.ended)
    //    {
    //        clearInterval(updateWorld);
    //    }
    if (wallsMesh.scale.y < 1)
    {
        wallsMesh.scale.y += .01;
        coolWallsMesh.scale.y += .01;
    }
    for(i=0;i<actors.length;++i)
    {
        actors[i].tick();

        //actors[i].mesh.position.z = -( (actors[i].posY*320) + (320)/2 );
        //actors[i].mesh.position.x = -( (actors[i].posX*320) + (320)/2 );
        //actors[i].mesh.position.y = 50;
        
        if(actors[i].mesh.scale.y < 1)
        {
            actors[i].mesh.scale.y += .01;
        }
    }
    pointLight.position.z = -( ($.posY*320) + (320)/2 );
    pointLight.position.x = -( ($.posX*320) + (320)/2 );
};
//////////////////////////////////

//////////////Main()//////////////
function init(){
    window.MazeScene = new THREE.Scene();

    $.ajaxSetup({async:false})

    window.MazeDebug = 0;

    window.MazeWidth = 12;
    window.MazeDepth = 12;
    $.wallImage = "wall.png";
    $.ceilImage = "ceiling.png";
    $.floorImage = "floor.png";
    $.rats = Math.ceil((window.MazeWidth*window.MazeDepth)/50);
    $.openglsigns = Math.ceil((window.MazeWidth*window.MazeDepth)/50);
    $.spinners = Math.ceil((window.MazeWidth*window.MazeDepth)/50);
    
    //$.rats = Math.ceil((window.MazeWidth*window.MazeDepth));

    //$.autopilot = $.getUrlVar('a');
    //$.autopilot = true;

    createActors();

    $(window).resize(ResizeHandling);
    
    var konami = new Konami();
    konami.code = flip;
    konami.load();
    
    $(window).keydown(KeyHandling);
    $.mouseX = 0;
    $.mouseY = 0;
    $().mousemove(MouseUpdate);
    $.turnInts = new Array();
    $.speed = 4;
    updateWorld = setInterval(UpdateWorld,10);
    
    $.t=0; //turning
    $.g=0; //going
    $.f=0; //flipping
    $.i=0; //temporary invincibility to $.rats
    $.p=0; //presses for go()
    $.p2=0; //presses for turn()
    face = 'n';
    
    //Creates the variable $.rows which is an array of arrays of cells of the maze
    windows95Maze(window.MazeWidth,window.MazeDepth);
    
    $.posX = Math.round(window.MazeWidth/2);
    $.posY = window.MazeDepth-1;
    
    //var ambient = new THREE.AmbientLight( 0xFFFFFF );
    //window.MazeScene.add( ambient );
    
    window.MazeCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    window.MazeCamera.position.z = -( ($.posY*320) + (320)/2 ) //+ (320/2);
    window.MazeCamera.position.y = 100;
    window.MazeCamera.position.x = -( $.posX*320 + (320/2));//-(window.MazeWidth*320)/2 - (320/2);
    window.MazeCamera.rotation.y = rad(180);
    window.MazeCamera.far = 100;// greater(window.MazeWidth,window.MazeDepth)*320;

    window.MazeScene.add( window.MazeCamera );
    
    pointLight = new THREE.PointLight( 0xFFFFFF );
    pointLight.position.z = -( ($.posY*320) + (320)/2 );
    pointLight.position.x = -( ($.posX*320) + (320)/2 );

    window.MazeScene.add(pointLight)
    
    
    var floorImg = new Image();
    floorImg.src = $.floorImage;

    floorImg.onload = function()
    {
        var floorGeometry = new THREE.CubeGeometry( 320*window.MazeWidth, 0, 320*window.MazeDepth, 1, 1, 1, null);
        var floorTexture = THREE.ImageUtils.loadTexture($.floorImage);
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
    
            if($.rows[y][x].up)
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
            if($.rows[y][x].left)
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
            if($.rows[y][x].down && y==window.MazeDepth-1) //It only does this on the outside so that there aren't cloned walls all over
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
            if($.rows[y][x].right && x==window.MazeWidth-1) //Ditto
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
    
    wallsMesh = new THREE.Mesh(combinedWalls, new THREE.MeshBasicMaterial({map: new THREE.ImageUtils.loadTexture($.wallImage)}));
    
    wallsMesh.scale.y = .05;
    
    window.MazeScene.add(wallsMesh);
    
    coolWallsMesh = new THREE.Mesh( coolWalls, new THREE.MeshBasicMaterial({map: new THREE.ImageUtils.loadTexture("globe.png")}));
    
    coolWallsMesh.scale.y = .05;
    
    window.MazeScene.add( coolWallsMesh );
    
    var ceilImg = new Image();
    ceilImg.src = $.ceilImage;

    ceilImg.onload = function()
    {
        var ceilGeometry = new THREE.CubeGeometry( 320*window.MazeWidth, 0, 320*window.MazeDepth, 1, 1, 1, null);
        var ceilTexture = THREE.ImageUtils.loadTexture($.ceilImage);
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