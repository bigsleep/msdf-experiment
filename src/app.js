import React from 'react';
import ReactDOM from 'react-dom';
import 'three';
import 'three/OrbitControls';
import metaData from './metadata.json';
import metrics from './metrics.json';

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
            text: "",
            fragmentShader: null,
            uniforms: {
                iResolution: {type: "v2", value: new THREE.Vector2(this.width, this.height)},
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

    changeText(text) {
        if (text === this.state.text) {
            return;
        }
        this.state.text = text
        const scale = 1.0;
        let ox = 0.0;
        const oy = 0.0;
        let positions = [];
        let uvs = [];
        for (let i = 0; i < text.length; i++) {
            const codepoint = text.charCodeAt(i);
            if (codepoint in metaData && codepoint in metrics) {
                const m1 = metaData[codepoint];
                const m2 = metrics[codepoint];
                const x0 = (ox - m2.translatex) * scale;
                const y0 = (oy - m2.translatey) * scale;
                const x1 = (x0 + m1.size[0] / m2.scale) * scale;
                const y1 = (y0 + m1.size[1] / m2.scale) * scale;
                const u0 = m1.position[0] / 512.0;
                const v0 = (512.0 - m1.position[1] - m1.size[1]) / 512.0;
                const u1 = (m1.position[0] + m1.size[0]) / 512.0;
                const v1 = (512.0 - m1.position[1]) / 512.0;
                Array.prototype.push.apply(positions,
                    [ x1, y0, 0.0
                    , x0, y0, 0.0
                    , x1, y1, 0.0
                    , x0, y1, 0.0
                    , x1, y1, 0.0
                    , x0, y0, 0.0
                    ]);
                Array.prototype.push.apply(uvs,
                    [ u1, v0
                    , u0, v0
                    , u1, v1
                    , u0, v1
                    , u1, v1
                    , u0, v0
                    ]);
                ox += m2.advance * scale;
            }
        }
        const pvs = new Float32Array(positions);
        const tvs = new Float32Array(uvs);
        this.three.geometry.addAttribute('position', new THREE.BufferAttribute(pvs, 3));
        this.three.geometry.addAttribute('uv', new THREE.BufferAttribute(tvs, 2));
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
        this.three.camera =new THREE.PerspectiveCamera( 45, this.width / this.height, 1, 10000 );// new THREE.OrthographicCamera(0.0, 1.0, 1.0, 0.0, 1.0, 1000.0);
        this.three.camera.position.set( 0, 20, 100 );
        this.three.camera.up = new THREE.Vector3(0.0, 1.0, 0.0);
        this.three.camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));

        this.three.scene = new THREE.Scene();

        this.three.renderer = new THREE.WebGLRenderer();
        this.three.renderer.setSize(this.width, this.height);
        this.three.renderer.setPixelRatio(window.devicePixelRatio);
        this.three.renderer.setClearColor(new THREE.Color(0xF0F0F0));
        container.appendChild(this.three.renderer.domElement);

        new THREE.OrbitControls(this.three.camera, this.three.renderer.domElement);

        const axes = new THREE.AxesHelper(10000);
        axes.position.set(0, 0, 0);
        this.three.scene.add(axes);

        const grid = new THREE.GridHelper(100, 50);
        this.three.scene.add(grid);

        this.three.geometry = new THREE.BufferGeometry();
        this.changeText("Hello, world");
        console.log(this.three.geometry);
        this.three.material = new THREE.ShaderMaterial({
            uniforms: this.state.uniforms,
            vertexShader: document.getElementById('vertexShader').textContent,
            fragmentShader: fragmentShader
        });
        this.three.material.side = THREE.DoubleSide;
        this.three.material.transparent = true;
        this.three.mesh = new THREE.Mesh(this.three.geometry, this.three.material);
        this.three.scene.add(this.three.mesh);

        this.animate();
        console.log("initializeThree end");
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
                        text <input type="text" onKeyUp={e => this.props.app.changeText(e.target.value)} />
                    </label>
                    <label>
                        fragment shader <Select optionValues={shaderNames} optionNames={shaderNames} onChange={selected => this.props.app.changeShader(selected)} />
                    </label>
                    <label>
                        texture <Select optionValues={textureNames} optionNames={textureNames} onChange={selected => this.props.app.changeTexture(selected)} />
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
