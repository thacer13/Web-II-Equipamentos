import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

interface DevLink {
  path: string;
  url: string;
  label: string;
  section: string;
}

@Component({
  selector: 'app-dev-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="devnav" [class.collapsed]="collapsed">
      <button class="devnav-toggle" (click)="collapsed = !collapsed" title="Prototype nav — delete shared/dev-nav to remove">
        {{ collapsed ? '☰ screens' : '✕ dev' }}
      </button>
      @if (!collapsed) {
        <div class="devnav-list">
          @for (link of links; track link.path) {
            @if (link.showHeader) {
              <div class="devnav-section">{{ link.section }}</div>
            }
            <a class="devnav-link" [routerLink]="link.url" routerLinkActive="active">
              {{ link.label }}
            </a>
          }
        </div>
      }
    </nav>
  `,
  styles: [`
    .devnav { position: fixed; right: 12px; top: 12px; z-index: 9999; background: #111827; color: #f9fafb;
      border-radius: 10px; padding: 8px; font-size: 13px; max-width: 220px; box-shadow: 0 4px 16px rgba(0,0,0,.35); opacity: .95; }
    .devnav-toggle { background: #374151; color: #fff; border: 0; border-radius: 6px; padding: 4px 10px;
      cursor: pointer; width: 100%; font-size: 12px; }
    .devnav-list { display: flex; flex-direction: column; gap: 2px; margin-top: 8px; max-height: 70vh; overflow: auto; }
    .devnav-section { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #9ca3af;
      margin: 8px 4px 2px; }
    .devnav-link { color: #e5e7eb; text-decoration: none; padding: 4px 8px; border-radius: 6px; }
    .devnav-link:hover { background: #374151; }
    .devnav-link.active { background: #2563eb; color: #fff; }
    .devnav.collapsed { max-width: none; }
  `],
})
export class DevNavComponent {
  collapsed = false;
  links: (DevLink & { showHeader: boolean })[];

  constructor() {
    const router = inject(Router);
    const seen = new Set<string>();
    const flat: DevLink[] = [];

    for (const r of router.config) {
      const path = r.path ?? '';
      if (!path || path === '**' || r.redirectTo) continue;
      if (r.data?.['hideDevNav']) continue;
      const hasParam = path.includes(':');
      const devLabel: string | undefined = r.data?.['devLabel'] ?? (typeof r.title === 'string' ? r.title : undefined);
      if (hasParam && !devLabel) continue; // keep box concise: param screens opt in via devLabel
      if (seen.has(path)) continue;
      seen.add(path);

      let url = '/' + path;
      const devParams: Record<string, string> | undefined = r.data?.['devParams'];
      if (hasParam) {
        url = url.replace(/:(\w+)/g, (_, key) => devParams?.[key] ?? '1');
      }

      const section = path.split('/')[0].toUpperCase();
      flat.push({ path, url, label: devLabel ?? prettify(path), section });
    }

    let lastSection = '';
    this.links = flat.map((l) => {
      const showHeader = l.section !== lastSection;
      lastSection = l.section;
      return { ...l, showHeader };
    });
  }
}

// boilerplatezao so pra nao ficar horrivel
function prettify(path: string): string {
  return path
    .split('/')
    .map((s) => (s.startsWith(':') ? `[${s.slice(1)}]` : s.charAt(0).toUpperCase() + s.slice(1)))
    .join(' / ');
}
