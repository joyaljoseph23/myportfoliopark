import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const raycaster=new THREE.Raycaster();
const pointer=new THREE.Vector2();
const canvas=document.getElementById("experience-canvas");
const sizes={
    width:window.innerWidth,
    height:window.innerHeight,
};


let character={
  instance:null,
  moveDistance:3,
  jumpHeight:1,
  isMoving:false,
  moveDuration:0.2, 
};

const renderer = new THREE.WebGLRenderer({canvas:canvas,antialias:true});
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.shadowMap.type=THREE.PCFShadowMap;
renderer.shadowMap.enabled=true;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=0.6;


const modalContent={
  "ProjectBoard003":{
    title:"EasyCodeLearner",
    content:"this is my channel where i share my knowledge as a hobby",
    link:"https://youtube.com/@easycodelearner?si=zRXPxuFTH0o1NcBZ"
  },
  "ProjectBoard004":{
    title:"My LinkedIn",
    content:"this is project one ",
    link:"https://iamjoyal.com"
  },
  "ProjectBoard005":{
    title:"Get in touch",
    content:"this is project one ",
    link:"https://iamjoyal.com"
  },
  Chest:{
    title:"About Me",
    content:"This is me"
  },


};

const modal=document.querySelector(".modal");
const modalTitle=document.querySelector(".modal-title");
const modalProjectDescription=document.querySelector(".modal-project-description");
const modalExitButton=document.querySelector(".modal-exit-button");
const modalVisitProjectButton=document.querySelector(".modal-project-visit-button");



function showModal(id){
  
 const content=modalContent[id];

 if(content){
  modalTitle.textContent=content.title;
  modalProjectDescription.textContent= content.content;
  if(content.link){
    modalVisitProjectButton.href=content.link;
    modalVisitProjectButton.classList.remove('hidden');
  }
  else{
    modalVisitProjectButton.classList.add('hidden');
  }
  modal.classList.toggle("hidden");
}
}

function hideModal(){
  modal.classList.toggle("hidden");
}

let intersectObject="";
const intersectObjects=[];
const intersectObjectsNames=[

  "ProjectBoard003",
  "ProjectBoard004",
  "ProjectBoard005",
  "Chest",
  
];


const loader = new GLTFLoader();

loader.load( './portfolio.glb', function ( glb ) {
  glb.scene.traverse((child)=>{
    //console.log(child.name);
    if(intersectObjectsNames.includes(child.name)){
      
        intersectObjects.push(child);
       
    }
    if(child.isMesh){
      child.castShadow=true;
      child.recieveShadow=true;
    }

    if(child.name==="Boots002"){

      console.log("Character found!");
      character.instance=child;
     

    }
  })
  scene.add( glb.scene );

}, undefined, function ( error ) {

  console.error( error );

} );

// White directional light at half intensity shining from the top.
const sun = new THREE.DirectionalLight( 0xffffff, 0.5 );
sun.castShadow=true;
sun.position.set(75,80,0);
sun.target.position.set(50,0,0);

sun.shadow.mapSize.width=4096;
sun.shadow.mapSize.height=4096;
sun.shadow.camera.left=-100;
sun.shadow.camera.right=100;
sun.shadow.camera.top=100;
sun.shadow.camera.bottom=-100;
sun.shadow.normalBias=0.3;
scene.add(sun);

const shadowHelper = new THREE.CameraHelper( sun.shadow.camera );
scene.add(shadowHelper);

const helper=new THREE.DirectionalLightHelper(sun,5);
scene.add(helper);

const color = 0xFFFFFF;
const intensity = 3;
const light = new THREE.AmbientLight(color, intensity);


scene.add(light);

const aspect=sizes.width /sizes.height;


const camera = new THREE.OrthographicCamera( 
    -aspect*50, 
     aspect*50,
     50,
     -50,

     1, 1000 );


// document.body.appendChild( renderer.domElement );
 camera.position.x = 152;
 camera.position.y = 59;

 camera.position.z = -142;


const controls = new OrbitControls( camera, canvas );
controls.update();


function onResize(){
    sizes.width=window.innerWidth
    sizes.height=window.innerHeight
    const aspect=sizes.width/sizes.height;
    camera.left=-aspect*50;
    camera.right= aspect*50;
    camera.top= 50;
    camera.bottom= -50;
    camera.updateProjectionMatrix();
    
    renderer.setSize( sizes.width, sizes.height );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
}

function onPointerMove(event){
pointer.x=(event.clientX /window.innerWidth)* 2-1;
pointer.y=-(event.clientY/ window.innerHeight)* 2+1;
}

function moveCharacter(targetPosition,targetRotation){
  //console.log(character.isMoving);
  character.isMoving=true;

  const t1=gsap.timeline({
    onComplete:()=>{
      character.isMoving=false;
    }
  });
  t1.to(character.instance.position,{
    x:targetPosition.x,
    z:targetPosition.z,
    duration:character.moveDuration,
  });

  t1.to(character.instance.rotation,{
    y:targetRotation,
    duration:character.moveDuration,
  },
  0 );
  //jumping
  t1.to(character.instance.position,{
    y:character.instance.position.y +character.jumpHeight,
    duration:character.moveDuration,
    yoyo:true,
    repeat:1,
  },
  0 );
}

function onKeyDown(event ){ 
  
  if(character.isMoving) return;
   
  const targetPosition=new THREE.Vector3().copy(character.instance.position);
  let targetRotation=0;

  switch(event.key.toLowerCase()){
    case "w":
    case "arrowup":
      targetPosition.z +=character.moveDistance;
      targetRotation=0;
      break;
    case "s":
    case "arrowdown":
      targetPosition.z-=character.moveDistance;
      targetRotation=Math.PI;
      break;
    case "a":
    case "arrowleft":
      targetPosition.x+=character.moveDistance;
      targetRotation=Math.PI/2;
      break;
    case "d":
    case "arrowright":
      targetPosition.x-=character.moveDistance;
      targetRotation= -Math.PI;
      break;
    default:
      return;
  }

    moveCharacter(targetPosition,targetRotation);
    
    
    

  
}

function onClick() 
{
//console.log(intersectObject);
if(intersectObject!=="")
{
  showModal(intersectObject);
}

}

modalExitButton.addEventListener("click",hideModal);
window.addEventListener("resize",onResize)
window.addEventListener("click",onClick)

window.addEventListener("pointermove",onPointerMove)
window.addEventListener("keydown",onKeyDown)


function animate() {
  raycaster.setFromCamera(pointer,camera);
  const intersects=raycaster.intersectObjects(intersectObjects);
  if(intersects.length>0){
    document.body.style.cursor="pointer";
  }
  else{
     document.body.style.cursor="default";
     intersectObject="";
  }
  for(let i=0;i<intersects.length;i++)
  {
    //console.log(intersects[0].object.parent.name);
    intersectObject=intersects[0].object.parent.name;
    //intersects[i].object.material.color.set(0xff0000);
  }
  renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );