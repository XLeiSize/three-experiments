import Dat from 'dat-gui'
import NumberUtils from './utils/number-utils'
import Scene from './scene/scene'

const EffectComposer = require('three-effectcomposer')(THREE);
const GlitchPass = require('./postprocessing/GlitchPass');
import DotScreenShader from './shaders/DotScreenShader';
import RGBShiftShader from'./shaders/RGBShiftShader';
import MirrorShader from'./shaders/MirrorShader';

import cubeVS from './shaders/cube/cube.vert';
import cubeFS from './shaders/cube/cube.frag';

import sphereVS from './shaders/sphere/sphere.vert';
import sphereFS from './shaders/sphere/sphere.frag';



class App {

  constructor() {

    this.DELTA_TIME = 0
    this.LAST_TIME = Date.now()

    this.width = window.innerWidth
    this.height = window.innerHeight

    this.scene = new Scene()
    this.controls;

    let root = document.body.querySelector( '.app' )
    root.appendChild( this.scene.renderer.domElement )


    this.addCube()
    this.addSphere()
    this.addPolyhedron()

    this.composer = new EffectComposer(this.scene.renderer);
    
    this.composer.addPass( new EffectComposer.RenderPass( this.scene.scene, this.scene.camera ) );

    var effect = new EffectComposer.ShaderPass( THREE.DotScreenShader );
    console.log(effect);
    effect.uniforms[ 'scale' ].value = 4;
    this.composer.addPass( effect );

    var effect = new EffectComposer.ShaderPass( THREE.RGBShiftShader );
    effect.uniforms[ 'amount' ].value = 0.0015;
    this.composer.addPass( effect ); 


    this.mirror = new EffectComposer.ShaderPass( THREE.MirrorShader );
    this.composer.addPass( this.mirror );
    this.mirror.renderToScreen = true;


    this.glitchPass = new THREE.GlitchPass();

    this.addListeners()

  }

  /**
   * addListeners
   */
  addListeners() {

    window.addEventListener( 'resize', this.onResize.bind(this) )
    TweenMax.ticker.addEventListener( 'tick', this.update.bind(this) )
    window.addEventListener('click', this.addGlitch.bind(this));

  }

  /**
   * Add cube to the scene
   */
  addCube() {

    const geometry = new THREE.BoxGeometry( 100, 100, 100 )

    var material = new THREE.MeshPhongMaterial( { color: 0xDDDDDD, shading: THREE.FlatShading } );

    this.cube = new THREE.Mesh( geometry, material )
    this.cube.position.x = window.innerWidth/2;
    this.cube.position.y = 20;
    this.cube.rotation.y = 45;
    console.log(this.cube);
    this.scene.add( this.cube )

  } 

  addSphere(){
    // set up the sphere vars
    const radius = 100,
        segments = 50,
        rings = 50;

    this.uniforms = {
      u_time: { type: 'f',
            value: '1.0' 
      },
      u_resolution: { type: 'v2',
            value: new THREE.Vector2(0, 0) 
      },
      amplitude: {
            type: 'f',
            value: 0
      },
      tExplosion: {
            type: "t", 
            value: THREE.TextureLoader( 'explosion.png' )
        },
        time: { // float initialized to 0
            type: "f", 
            value: 0.0 
        }
    }

    var sphereGeometry = new THREE.SphereGeometry(radius, segments, rings );
    this.geometry = new THREE.BufferGeometry().fromGeometry( sphereGeometry );

    this.displacement = new Float32Array( this.geometry.attributes.position.count );
    this.noise = new Float32Array( this.geometry.attributes.position.count );
    
    for ( var i = 0; i < this.displacement.length; i ++ ) {

      this.noise[ i ] = Math.random() * 5;

    }

    this.geometry.addAttribute( 'displacement', new THREE.BufferAttribute( this.displacement, 1 ) );


    this.sphereMaterial = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: sphereVS(),
      fragmentShader: sphereFS(),
    });

     this.sphere = new THREE.Mesh(
        this.geometry,
        this.sphereMaterial
      );


    this.scene.add( this.sphere );

  }

  addPolyhedron(){

    var verticesOfCube = [
        -1,-1,-1,    1,-1,-1,    1, 1,-1,    -1, 1,-1,
        -1,-1, 1,    1,-1, 1,    1, 1, 1,    -1, 1, 1,
    ];

    var indicesOfFaces = [
        2,1,0,    0,3,2,
        0,4,7,    7,3,0,
        0,1,5,    5,4,0,
        1,2,6,    6,5,1,
        2,3,7,    7,6,2,
        4,5,6,    6,7,4
    ];

    var geometry = new THREE.PolyhedronGeometry( verticesOfCube, indicesOfFaces, 180, 2 );
    var material = new THREE.MeshPhongMaterial( { color: 0xFFFFFF, shading: THREE.FlatShading } );


     this.polyhedron = new THREE.Mesh(
        geometry,
        material
      );

     this.polyhedron.position.x = window.innerWidth/4;

     this.scene.add( this.polyhedron );

  }

  addGlitch(){
    
    var glitchPass = this.glitchPass; 
    glitchPass.curF = 20;
    if(glitchPass.goWild == false){
     glitchPass.goWild = true;
     glitchPass.enabled = true;
     window.setTimeout(function(){
        glitchPass.goWild = false;
        glitchPass.enabled = false;
     },300);
    }else{
      glitchPass.goWild = false;
      glitchPass.enabled = false;
    }

     this.composer.addPass( glitchPass );
     glitchPass.renderToScreen = true;
  }

  /**
   * update
   * - Triggered on every TweenMax tick
   */
  update() {

    this.DELTA_TIME = Date.now() - this.LAST_TIME
    this.LAST_TIME = Date.now()

    this.sphere.rotation.x -= .02
    this.sphere.rotation.y -= .03

    this.cube.rotation.x += .06

    // this.uniforms.amplitude.value = 2.5 * Math.sin( this.sphere.rotation.y * 0.125 );

    // for ( var i = 0; i < this.displacement.length; i ++ ) {

    //   this.displacement[ i ] = Math.sin( 0.5 * i + this.DELTA_TIME );

    //   this.noise[ i ] += 0.5 * ( 0.5 - Math.random() );
    //   this.noise[ i ] = THREE.Math.clamp( this.noise[ i ], -5, 5 );

    //   this.displacement[ i ] += this.noise[ i ];

    // }

    // this.sphere.geometry.attributes.displacement.needsUpdate = true; 


    this.polyhedron.rotation.x += .01
    this.polyhedron.rotation.y += .01
    this.polyhedron.rotation.z += .01

    

    // if(this.polyhedron .position.x < window.width){
    //   this.polyhedron.position.x -= Math.random() * 1 + 2
    // }else if(this.polyhedron.position.x > 0 ){
    //   this.polyhedron.position.x += Math.random() * 1 + 2
    // }

    this.scene.render()
    this.composer.render()

  }



  /**
   * onResize
   * - Triggered when window is resized
   * @param  {obj} evt
   */
  onResize( evt ) {

    this.width = window.innerWidth
    this.height = window.innerHeight
    this.composer.setSize(this.width, this.height);
    this.scene.resize( this.width, this.height )


  }


}

export default App
