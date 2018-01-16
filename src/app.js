import React from 'react';
import ReactDOM from 'react-dom';
import * as THREE from 'three';

const shaderNames = [
    "msdfFragmentShader",
];

const textureNames = [
    "resources/texture0.png",
];

const filterNames = [
    "Linear",
    "Nearest",
];

const filterTypes = [
    THREE.LinearFilter,
    THREE.NearestFilter,
];

class App {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.state = {
            fragmentShader: null,
            uniforms: {
                iResolution: { type: "v2", value: new THREE.Vector2(this.width, this.height) },
            }
        }

        this.three = {};
        this.onUpdate = () => {};
    }

    loadTexture(textureUrl) {
        const loader = new THREE.TextureLoader();
        return new Promise(resolve => {
            loader.load(textureUrl, texture => {
                resolve(texture);
            });
        });
    }

    changeTexture(textureUrl) {
        const self = this;
        this.loadTexture(textureUrl)
            .then(texture => {
                texture.minFilter = this.state.uniforms.iTexture.value.minFilter;
                texture.magFilter = this.state.uniforms.iTexture.value.magFilter;
                self.state.uniforms.iTexture.value = texture;
                self.state.uniforms.iTextureSize.value = new THREE.Vector2(texture.image.width, texture.image.width);
                self.onUpdate(self.state);
            });
    }

    changeShader(shaderName) {
        this.three.material.fragmentShader = document.getElementById(shaderName).textContent;
        this.three.material.needsUpdate = true;
        this.onUpdate(this.state);
    }

    changeTextureMinFilter(filterType) {
        this.state.uniforms.iTexture.value.minFilter = parseInt(filterType, 10);
        this.state.uniforms.iTexture.value.needsUpdate = true;
        this.onUpdate(this.state);
    }

    changeTextureMagFilter(filterType) {
        this.state.uniforms.iTexture.value.magFilter = parseInt(filterType, 10);
        this.state.uniforms.iTexture.value.needsUpdate = true;
        this.onUpdate(this.state);
    }

    initialize(container, shaderName, textureUrl, onUpdate) {
        console.log("initialize");
        console.log(textureUrl);
        const self = this;
        const shader = document.getElementById(shaderName).textContent;
        this.onUpdate = onUpdate;
        this.loadTexture(textureUrl)
            .then(texture => {
                console.log("aaa");
                self.initializeThree(container, shader, texture);
            });
    }

    initializeThree(container, fragmentShader, texture) {
        console.log("initializeThree");
        this.state.uniforms.iTexture =  { type: "t", value: texture };
        this.state.uniforms.iTextureSize = { type: "v2", value: new THREE.Vector2(texture.image.width, texture.image.width) };
        this.three.camera = new THREE.Camera();
        this.three.camera.position.z = 1;
        this.three.geometry = new THREE.PlaneBufferGeometry(2, 2);
        this.three.material = new THREE.ShaderMaterial({
            uniforms: this.state.uniforms,
            vertexShader: document.getElementById('vertexShader').textContent,
            fragmentShader: fragmentShader
        });
        this.three.mesh = new THREE.Mesh(this.three.geometry, this.three.material);
        this.three.scene = new THREE.Scene;
        this.three.scene.add(this.three.mesh);

        this.three.renderer = new THREE.WebGLRenderer();
        this.three.renderer.setSize(this.width, this.height);
        this.three.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.three.renderer.domElement);

        this.animate();
    }

    animate() {
        const self = this;
        const callback = () => { self.animate() };
        requestAnimationFrame(callback);
        this.render();
    }

    render() {
        this.three.renderer.render(this.three.scene, this.three.camera);
        this.onUpdate(this.state);
    }
}

class View extends React.Component {
    render() {
        return (
            <div>
                <div>
                    <label>
                        text <input type="text" />
                    </label>
                    <label>
                        fragment shader <Select optionValues={shaderNames} optionNames={shaderNames} onChange={selected => this.props.shaderViewer.changeShader(selected)} />
                    </label>
                    <label>
                        texture <Select optionValues={textureNames} optionNames={textureNames} onChange={selected => this.props.shaderViewer.changeTexture(selected)} />
                    </label>
                    <label>
                        min filter <Select optionValues={filterTypes} optionNames={filterNames} onChange={selected => this.props.app.changeTextureMinFilter(selected)} />
                    </label>
                    <label>
                        mag filter <Select optionValues={filterTypes} optionNames={filterNames} onChange={selected => this.props.app.changeTextureMagFilter(selected)} />
                    </label>
                </div>
                <ThreeView app={this.props.app} />
            </div>
        );
    }
}

class ThreeView extends React.Component {
    componentDidMount() {
        this.props.app.initialize(this.container, shaderNames[0], textureNames[0], this.setState.bind(this));
    }

    render() {
        return <div className="threeView" ref={thisNode => {this.container = thisNode}}></div>;
    }
}

class Select extends React.Component {
    render() {
        const options = this.props.optionValues.map((value, index) => {
            return (<option key={index} value={value}>{this.props.optionNames[index]}</option>);
        });

        const onChange = e => {
            const options = e.target.options;
            const value = options[e.target.selectedIndex].value;
            this.props.onChange(value);
        }

        return (<select onChange={onChange}>{options}</select>);
    }
}

const app = new App(600.0, 400.0);
ReactDOM.render(<View app={app} />, document.getElementById('root'));
