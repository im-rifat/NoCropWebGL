import { glutil } from "./glutil";

class BaseFilter {

    static DEFAULT_VERTEX_SHADER = "";
    static DEFAULT_FRAGMENT_SHADER = "";

    constructor(gl) {
        this._webgl = gl;

        this._vertex_shader_source = DEFAULT_VERTEX_SHADER;
        this.fragment_shader_source = DEFAULT_FRAGMENT_SHADER;

        this._vertex_shader = -1;
        this._fragment_shader = -1;
        this._program = -1;
        this._vertex_buffer = -1;
    }

    setUp() {
        this.release();

        this._vertex_shader = glutil.loadShader(this._webgl, this._vertex_shader_source);
        this._fragment_shader = glutil.loadShader(this._webgl, this.fragment_shader_source);

        this._program = glutil.createProgram(this._webgl, this._vertex_shader, this._fragment_shader);

        let gl = this._webgl;

        this._vertex_buffer = glutil.createBuffer(gl, [
            0, 0,
            0, gl.canvas.height,
            gl.canvas.width, 0,
            gl.canvas.width, 0,
            0, gl.canvas.height,
            gl.canvas.width, gl.canvas.height
        ]);

        this._handle_map = new Map();
    }

    setFrameSize(width, height) {
    }

    release() {
        this._webgl.deleteProgram(this._program);
        this._program = -1;

        this._webgl.deleteShader(this._fragment_shader);
        this._fragment_shader = -1;

        this._webgl.deleteShader(this._vertex_shader);
        this._vertex_shader = -1;

        this._webgl.deleteBuffer(this._vertex_buffer);
        this._vertex_buffer = -1;

        this._handle_map.clear();
    }

    draw(tex_name, fbo) {
    }

    // protected
    onDraw() {
    }

    useProgram() {
    }

    vertexBufferName() {
    }

    handle(name) {
        let id = this._handle_map.get(name);

        if(id != undefined) return id;

        id = this._webgl.getAttribLocation(name);

        if(id == -1) {
            id = this._webgl.getUniformLocation(name);

            if(id == -1) throw new Error("handle named " + name + " not found in shader");
        }

        this._handle_map.set(name, id);

        return id;
    }
}