// WebGL shader code from https://github.com/Firch/BuncoWeb
import './index.css';
import { useEffect, useRef } from 'react';

interface BackgroundProps {
  className?: string;
}

const Background = ({ className }: BackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const animationRef = useRef<number>(0);
  
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformLocationsRef = useRef<{
    resolution: WebGLUniformLocation | null;
    time: WebGLUniformLocation | null;
    spinTime: WebGLUniformLocation | null;
  }>({ resolution: null, time: null, spinTime: null });

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');
    
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }
    
    glRef.current = gl;
    
    // Resize canvas to fill window
    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const vertexShaderSource = `
      #version 100
      attribute vec2 a_position;
      varying vec2 v_texcoord;

      void main() {
          v_texcoord = a_position * 0.5 + 0.5;
          gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      #version 100
      precision highp float;

      #define MY_HIGHP_OR_MEDIUMP highp
      #define number float

      #define SPIN_EASE 0.5

      varying vec2 v_texcoord;

      uniform vec2 iResolution;
      uniform MY_HIGHP_OR_MEDIUMP number time;
      uniform MY_HIGHP_OR_MEDIUMP number spin_time;

      vec4 effect( vec4 colour, vec2 screen_coords )
      {
          vec2 love_ScreenSize = iResolution.xy;

          MY_HIGHP_OR_MEDIUMP vec4 colour_1 = vec4(0.6, 0.2, 0.2, 1.0); // red (outside)
          MY_HIGHP_OR_MEDIUMP vec4 colour_2 = vec4(0.1, 0.3, 1.0, 1.0); // blue (inside)
          MY_HIGHP_OR_MEDIUMP vec4 colour_3 = vec4(0.0, 0.0, 0.0, 1.0); // black (accents)
          MY_HIGHP_OR_MEDIUMP number contrast = 1.0;
          MY_HIGHP_OR_MEDIUMP number spin_amount = 0.9;

          //Convert to UV coords (0-1) and floor for pixel effect
          MY_HIGHP_OR_MEDIUMP number pixel_size = 1.0;
          MY_HIGHP_OR_MEDIUMP vec2 uv = (floor(screen_coords.xy*(1./pixel_size))*pixel_size - 0.5*love_ScreenSize.xy)/length(love_ScreenSize.xy) - vec2(0.12, 0.);
          MY_HIGHP_OR_MEDIUMP number uv_len = length(uv);

          //Adding in a center swirl, changes with time. Only applies meaningfully if the 'spin amount' is a non-zero number
          MY_HIGHP_OR_MEDIUMP number speed = (spin_time*SPIN_EASE*0.05) + 302.2;
          MY_HIGHP_OR_MEDIUMP number new_pixel_angle = (atan(uv.y, uv.x)) + speed - SPIN_EASE*20.*(1.*spin_amount*uv_len + (1. - 1.*spin_amount));
          MY_HIGHP_OR_MEDIUMP vec2 mid = (love_ScreenSize.xy/length(love_ScreenSize.xy))/2.;
          uv = (vec2((uv_len * cos(new_pixel_angle) + mid.x), (uv_len * sin(new_pixel_angle) + mid.y)) - mid);

          //Now add the paint effect to the swirled UV
          uv *= 30.;
          speed = time*(2.);
          MY_HIGHP_OR_MEDIUMP vec2 uv2 = vec2(uv.x+uv.y);

          for(int i=0; i < 5; i++) {
              uv2 += sin(max(uv.x, uv.y)) + uv;
              uv  += 0.5*vec2(cos(5.1123314 + 0.353*uv2.y + speed*0.131121),sin(uv2.x - 0.113*speed));
              uv  -= 1.0*cos(uv.x + uv.y) - 1.0*sin(uv.x*0.711 - uv.y);
          }

          //Make the paint amount range from 0 - 2
          MY_HIGHP_OR_MEDIUMP number contrast_mod = (0.25*contrast + 0.5*spin_amount + 1.2);
          MY_HIGHP_OR_MEDIUMP number paint_res =min(2., max(0.,length(uv)*(0.035)*contrast_mod));
          MY_HIGHP_OR_MEDIUMP number c1p = max(0.,1. - contrast_mod*abs(1.-paint_res));
          MY_HIGHP_OR_MEDIUMP number c2p = max(0.,1. - contrast_mod*abs(paint_res));
          MY_HIGHP_OR_MEDIUMP number c3p = 1. - min(1., c1p + c2p);

          MY_HIGHP_OR_MEDIUMP vec4 ret_col = (0.3/contrast)*colour_1 + (1. - 0.3/contrast)*(colour_1*c1p + colour_2*c2p + vec4(c3p*colour_3.rgb, c3p*colour_1.a));

          return ret_col;
      }

      void main() {
          vec2 uv = v_texcoord;
          uv.y = 1.0 - uv.y;
          uv.x += 2.0/15.0;
          vec2 fragCoord = uv * iResolution;
          gl_FragColor = effect(vec4(1.0, 1.0, 0.0, 1.0), fragCoord);
      }
    `;

    const compileShader = (source: string, type: number): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation failed:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      
      return shader;
    };

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    
    if (!vertexShader || !fragmentShader) return;
    
    const program = gl.createProgram();
    if (!program) return;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking failed:', gl.getProgramInfoLog(program));
      return;
    }
    
    gl.useProgram(program);
    programRef.current = program;

    const vertices = new Float32Array([
      -1.0,  1.0,
      -1.0, -1.0,
       1.0,  1.0,
       1.0, -1.0,
    ]);
    
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);
    
    uniformLocationsRef.current = {
      resolution: gl.getUniformLocation(program, 'iResolution'),
      time: gl.getUniformLocation(program, 'time'),
      spinTime: gl.getUniformLocation(program, 'spin_time'),
    };
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  useEffect(() => {
    const animate = () => {
      if (!canvasRef.current || !glRef.current || !programRef.current) return;
      
      const gl = glRef.current;
      const canvas = canvasRef.current;
      
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      const time = performance.now() / 1000;
      
      gl.uniform2f(uniformLocationsRef.current.resolution, canvas.width, canvas.height);
      gl.uniform1f(uniformLocationsRef.current.time, time);
      gl.uniform1f(uniformLocationsRef.current.spinTime, time);
      
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className={className}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1
      }}
    />
  );
};

export default Background;