const OrbitControls = require('three-orbit-controls')(THREE);
/*scene.js*/

class Scene {

  /**
   * @constructor
   */
  constructor() {

    this.width = window.innerWidth
    this.height = window.innerHeight

    this.renderer = new THREE.WebGLRenderer( this.width, this.height, { antialias: true } )
    this.camera = new THREE.PerspectiveCamera( 45, this.width / this.height, 1, 2000 ) 
    this.scene = new THREE.Scene()
    
    
    this.renderer.setSize( this.width, this.height )

    this.controls = new OrbitControls( this.camera );
    this.controls.minDistance = 600;
    this.controls.maxDistance = 5000;

    this.camera.position.z = 1000;
    this.camera.position.z = 1000;

    this.pointLight =
    new THREE.PointLight(0xFFFFFF);

    // set its position
    this.pointLight.position.x = 10;
    this.pointLight.position.y = 50;
    this.pointLight.position.z = 500;

    // add to the scene
    this.scene.add(this.pointLight);

  }

  /**
   * Add a child to the scene
   *
   * @param {Obj} child - a THREE object
   */
  add( child ) {

    this.scene.add( child )

  }

  /**
   * Remove a child from the scene
   *
   * @param {Obj} child - a THREE object
   */
  remove( child ) {

    this.scene.remove( child )

  }

  /**
   * Renders/Draw the scene
   */
  render() {

    this.renderer.render( this.scene, this.camera )

  }


  /**
   * Resize the scene according to screen size
   *
   * @param {Number} newWidth
   * @param {Number} newHeight
   */
  resize( newWidth, newHeight ) {

    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()

    this.renderer.setSize( newWidth, newHeight )

  }

}

export default Scene
