'use strict';

(function initSafeDom(global) {
  function toStringValue(value) {
    if (value === null || value === undefined) return '';
    return String(value);
  }

  function escapeHTML(value) {
    const span = document.createElement('span');
    span.textContent = toStringValue(value);
    return span.innerHTML;
  }

  function clear(node) {
    if (!node) return node;
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
    return node;
  }

  function append(node, ...children) {
    if (!node) return node;
    children.flat().forEach((child) => {
      if (child === null || child === undefined || child === false) return;
      if (typeof child === 'string' || typeof child === 'number') {
        node.appendChild(document.createTextNode(String(child)));
        return;
      }
      node.appendChild(child);
    });
    return node;
  }

  function setAttributes(node, attrs = {}) {
    Object.entries(attrs).forEach(([name, value]) => {
      if (value === null || value === undefined || value === false) return;
      node.setAttribute(name, toStringValue(value));
    });
  }

  function el(tagName, options = {}, children = []) {
    const node = document.createElement(tagName);
    const {
      className,
      text,
      html,
      attrs,
      dataset,
      listeners,
      value,
      checked,
      disabled
    } = options;

    if (className) node.className = className;
    if (text !== undefined) node.textContent = toStringValue(text);
    if (html !== undefined) node.innerHTML = html;
    if (value !== undefined) node.value = toStringValue(value);
    if (checked !== undefined) node.checked = Boolean(checked);
    if (disabled !== undefined) node.disabled = Boolean(disabled);
    if (attrs) setAttributes(node, attrs);
    if (dataset) {
      Object.entries(dataset).forEach(([name, value]) => {
        if (value === null || value === undefined) return;
        node.dataset[name] = toStringValue(value);
      });
    }
    if (listeners) {
      Object.entries(listeners).forEach(([eventName, handler]) => {
        if (typeof handler === 'function') {
          node.addEventListener(eventName, handler);
        }
      });
    }

    append(node, children);
    return node;
  }

  function isRelativeUrl(raw) {
    return !/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(raw) && !raw.startsWith('//');
  }

  function safeURL(url, options = {}) {
    const {
      allowRelative = true,
      allowMailto = false,
      allowTel = false,
      allowDataImage = false,
      allowBlob = false,
      allowHash = false,
      allowedHosts = null
    } = options;

    const raw = toStringValue(url).trim();
    if (!raw) return '';

    if (allowHash && raw.startsWith('#') && !raw.startsWith('#/')) {
      return raw;
    }

    if (allowRelative && isRelativeUrl(raw)) {
      return raw;
    }

    try {
      const parsed = new URL(raw);
      const protocol = parsed.protocol.toLowerCase();
      if ((protocol === 'http:' || protocol === 'https:') &&
          (!allowedHosts || allowedHosts.includes(parsed.host))) {
        return parsed.href;
      }
      if (protocol === 'mailto:' && allowMailto) {
        return raw;
      }
      if (protocol === 'tel:' && allowTel) {
        return raw;
      }
      if (protocol === 'data:' && allowDataImage &&
          /^data:image\/[a-z0-9.+-]+;base64,/i.test(raw)) {
        return raw;
      }
      if (protocol === 'blob:' && allowBlob) {
        return parsed.href;
      }
    } catch (error) {
      return '';
    }

    return '';
  }

  function setSafeURL(node, attributeName, url, options) {
    if (!node) return '';
    const safe = safeURL(url, options);
    if (safe) {
      node.setAttribute(attributeName, safe);
    } else {
      node.removeAttribute(attributeName);
    }
    return safe;
  }

  function setImageSource(img, url, options = {}) {
    if (!img) return '';
    const {
      fallback = '',
      allowRelative = true,
      allowDataImage = true,
      allowBlob = true
    } = options;
    const safe = safeURL(url, { allowRelative, allowDataImage, allowBlob });
    if (safe) {
      img.src = safe;
      return safe;
    }
    if (fallback) {
      img.src = fallback;
    } else {
      img.removeAttribute('src');
    }
    return '';
  }

  function emailHref(email) {
    const value = toStringValue(email).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '';
    return `mailto:${value}`;
  }

  function normalizePhone(phone) {
    return toStringValue(phone).replace(/\D/g, '');
  }

  function whatsappHref(phone, message = '') {
    const digits = normalizePhone(phone);
    if (!digits) return '';
    const base = `https://wa.me/${digits}`;
    return message ? `${base}?text=${encodeURIComponent(toStringValue(message))}` : base;
  }

  function sanitize(value) {
    return escapeHTML(value);
  }

  function sanitizeURL(url) {
    return safeURL(url, {
      allowRelative: true,
      allowMailto: true,
      allowTel: true,
      allowDataImage: true,
      allowBlob: true,
      allowHash: true
    });
  }

  function sanitizeHTML(html) {
    const dirty = toStringValue(html);
    if (!dirty) return '';

    let cleaned = dirty;
    if (typeof DOMPurify !== 'undefined') {
      cleaned = DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [
          'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'a', 'strong', 'em', 'b', 'i',
          'blockquote', 'br', 'img', 'figure', 'figcaption', 'hr', 'sub', 'sup',
          'pre', 'code'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'loading'],
        FORBID_TAGS: [
          'script', 'style', 'iframe', 'object', 'embed', 'form', 'input',
          'textarea', 'select', 'button', 'link', 'meta', 'base', 'svg', 'math'
        ],
        FORBID_ATTR: [
          'style', 'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus',
          'onblur', 'onsubmit', 'onreset', 'onchange', 'oninput', 'onkeydown',
          'onkeyup', 'onkeypress', 'onmousedown', 'onmouseup', 'onmousemove',
          'ondblclick'
        ],
        ALLOW_DATA_ATTR: false
      });
    }

    const template = document.createElement('template');
    template.innerHTML = cleaned;

    template.content.querySelectorAll('a[href]').forEach((anchor) => {
      const safeHref = safeURL(anchor.getAttribute('href'), {
        allowRelative: true,
        allowMailto: true,
        allowHash: true
      });
      if (!safeHref) {
        anchor.removeAttribute('href');
        anchor.removeAttribute('target');
        anchor.removeAttribute('rel');
        return;
      }
      anchor.setAttribute('href', safeHref);
      if (anchor.getAttribute('target') === '_blank') {
        anchor.setAttribute('rel', 'noopener noreferrer');
      } else {
        anchor.removeAttribute('target');
        anchor.removeAttribute('rel');
      }
    });

    template.content.querySelectorAll('img[src]').forEach((img) => {
      const safeSrc = safeURL(img.getAttribute('src'), { allowRelative: true });
      if (!safeSrc) {
        img.remove();
        return;
      }
      img.setAttribute('src', safeSrc);
      img.setAttribute('loading', 'lazy');
    });

    template.content.querySelectorAll('*').forEach((node) => {
      Array.from(node.attributes).forEach((attribute) => {
        if (/^on/i.test(attribute.name)) {
          node.removeAttribute(attribute.name);
        }
      });
    });

    return template.innerHTML;
  }

  global.SafeDOM = {
    append,
    clear,
    el,
    emailHref,
    escapeHTML,
    normalizePhone,
    safeURL,
    sanitizeHTML,
    setImageSource,
    setSafeURL,
    toStringValue,
    whatsappHref
  };
  global.sanitize = sanitize;
  global.sanitizeURL = sanitizeURL;
  global.sanitizeHTML = sanitizeHTML;
  global._as = sanitize;
  global._au = sanitizeURL;
})(window);
