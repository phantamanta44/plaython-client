importScripts('skulpt.min.js', 'skulpt-stdlib.js');

Sk.configure({
  read(file) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles['files'][file] === undefined) {
      throw 'File not found: "' + file + '"';
    }
    return Sk.builtinFiles['files'][file];
  },
  output(data) {
    postMessage({
      type: 'stdout', data
    });
  }
});

let ctx = null;
Object.entries({
  set_col(r, g, b) {
    postMessage({
      type: 'gl_col',
      r: Math.round(r),
      g: Math.round(g),
      b: Math.round(b)
    });
  },
  draw_rect(x, y, w, h) {
    postMessage({type: 'gl_rect', x, y, w, h});
  },
  draw_pixel(x, y) {
    postMessage({type: 'gl_pix', x, y});
  },
  draw_text(x, y, fontSize, text) {
    postMessage({type: 'gl_text', x, y, f: fontSize, t: text});
  },
  erase(x, y, w, h) {
    postMessage({type: 'gl_clear', x, y, w, h});
  },
  clear() {
    postMessage({type: 'gl_wipe'});
  },
  copy_rect(x, y, w, h) {
    postMessage({type: 'gl_sub_new', x, y, w, h, a: ctx.extractImageIndex});
    return new Sk.builtin.int_(ctx.extractImageIndex++);
  },
  paste_rect(x, y, w, h, image) {
    if (!h || !image) {
      postMessage({type: 'gl_sub_pas', x, y, a: w});
    } else {
      postMessage({type: 'gl_sub_cmp', x, y, w, h, a: image});
    }
  },
  draw_line(x1, y1, x2, y2, thickness) {
    postMessage({type: 'gl_line', x: x1, y: y1, a: x2, b: y2, t: thickness});
  },
  draw_circle(x, y, radius) {
    postMessage({type: 'gl_circ', x, y, r: radius});
  },
  gl_raw(script) {
    postMessage({type: 'gl_raw', s: script});
  }
}).forEach(f =>
  Sk.builtins[f[0]] = Sk.builtin[f[0]] = (e =>
    new Sk.builtin.func(function(...args) {
      return e(...args.map(a => a.v));
    })
  )(f[1])
);

onmessage = m => {
  try {
    ctx = {extractImageIndex: 0};
    Sk.importMainWithBody('<stdin>', false, m.data);
  } catch (e) {
    postMessage({type: 'stderr', data: e.toString()});
  } finally {
    postMessage({type: 'done'});
  }
};