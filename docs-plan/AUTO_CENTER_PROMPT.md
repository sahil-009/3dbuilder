# Auto-Center Camera on GLB Model - Antigravity Prompt

## Objective
Implement automatic camera centering for Three.js/React Three Fiber applications that mimics Blender/Unreal Engine's import behavior: when a GLB model loads, compute its bounding box center and automatically set OrbitControls to pivot around that center.

## Technical Requirements

### 1. Bounding Box Calculation
- Use Three.js `Box3` to compute the bounding box of the loaded GLB scene
- Extract the center point using `box.getCenter(center)`
- Calculate this AFTER the model loads (in `useEffect`)

### 2. State Management Flow
```
Scene Component → computes center → passes via callback → App state → Controls Component
```

### 3. OrbitControls Target Update
- Set `orbitControls.target.copy(modelCenter)`
- Call `orbitControls.update()` to apply changes
- React to center changes via `useEffect` with `modelCenter` dependency

## Implementation Pattern

### Scene.jsx
```javascript
import { Box3, Vector3 } from 'three';
import { useGLTF } from '@react-three/drei';

function Structure({ onCenterCalculated }) {
  const { scene } = useGLTF('/model.glb');
  
  useEffect(() => {
    if (scene && onCenterCalculated) {
      const box = new Box3().setFromObject(scene);
      const center = new Vector3();
      box.getCenter(center);
      onCenterCalculated(center);
    }
  }, [scene, onCenterCalculated]);
  
  return <primitive object={scene} />;
}

export default function Scene({ onCenterCalculated }) {
  return (
    <>
      <ambientLight />
      <Structure onCenterCalculated={onCenterCalculated} />
    </>
  );
}
```

### Controls.jsx
```javascript
import { OrbitControls } from '@react-three/drei';

export default function Controls({ modelCenter }) {
  const orbitRef = useRef();
  
  useEffect(() => {
    if (orbitRef.current && modelCenter) {
      orbitRef.current.target.copy(modelCenter);
      orbitRef.current.update();
    }
  }, [modelCenter]);
  
  return <OrbitControls ref={orbitRef} />;
}
```

### App.jsx
```javascript
function App() {
  const [modelCenter, setModelCenter] = useState(null);
  
  return (
    <Canvas>
      <Scene onCenterCalculated={setModelCenter} />
      <Controls modelCenter={modelCenter} />
    </Canvas>
  );
}
```

## Key Principles

1. **Separation of Concerns**: Scene computes geometry, Controls handles camera
2. **Callback Pattern**: Use props to pass data up from child to parent
3. **Reactive Updates**: Use `useEffect` to respond to state changes
4. **Blender-like UX**: User expects model to be centered on load, not arbitrary origin

## Common Pitfalls to Avoid

- ❌ Don't set target before model loads (will be `null`)
- ❌ Don't forget to call `update()` after changing target
- ❌ Don't compute bounding box on every render (use `useEffect`)
- ❌ Don't hardcode target coordinates

## Expected Behavior

✅ Model loads → bounding box computed → OrbitControls target set → camera orbits around model center
✅ Works for any GLB file, regardless of origin point in modeling software
✅ Matches Blender/Unreal import experience

## Dependencies Required
```json
{
  "@react-three/fiber": "^8.x",
  "@react-three/drei": "^9.x",
  "three": "^0.160.x"
}
```

## Testing Checklist
- [ ] Model appears centered in viewport on load
- [ ] Orbit rotation pivots around model center, not world origin
- [ ] Works with models of different sizes
- [ ] Works with models exported from different tools (Blender, Maya, etc.)
- [ ] Camera distance adjusts appropriately for model scale

---

**Use this prompt when**: Building 3D viewers, model inspection tools, or any React Three Fiber app that loads external GLB/GLTF files and needs professional camera behavior.
