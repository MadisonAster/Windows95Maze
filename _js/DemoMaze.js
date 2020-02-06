///////////////Main///////////////
function Init(){
    window.DemoMaze = new Windows95Maze(12,12, window.innerWidth, window.innerHeight);
    window.addEventListener('resize', ResizeHandling);
    window.addEventListener('keydown', KeyHandling);
    document.body.appendChild(window.DemoMaze.MazeRenderer.domElement);
    window.DemoMaze.Animate();
}

function ResizeHandling(){
    window.DemoMaze.MazeRenderer.setSize(window.innerWidth, window.innerHeight);
}

function KeyHandling(event){
        switch(event.keyCode)
        {
            case 87: //w
            case 38: //Up
                window.DemoMaze.Go('f');
                break;
            case 65: //a
            case 37: //Left
                window.DemoMaze.Turn('l');
                break;
            case 83: //s
            case 40: //Down
                window.DemoMaze.Go('b');
                break;
            case 68: //d
            case 39: //Right
                window.DemoMaze.Turn('r');
                break;
        }
}
//////////////////////////////////