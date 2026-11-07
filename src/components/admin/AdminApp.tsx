import { ExternalLink, MessageCircle, Package, RotateCcw, ShoppingBag, Store } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { useStore } from '@nanostores/react';
import { $catalogOrders, resetDemo } from '@/lib/stores';
import { url } from '@/lib/catalog';
import OrdersPanel from './OrdersPanel';
import ProductsPanel from './ProductsPanel';

export type AdminPage = 'pedidos' | 'produtos';

const titles: Record<AdminPage, string> = { pedidos: 'Pedidos', produtos: 'Produtos' };

export default function AdminApp({ page }: { page: AdminPage }) {
  const orders = useStore($catalogOrders);
  const novos = orders.filter((o) => o.status === 'Novo').length;

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <a href="/admin/pedidos">
                    <img src="/logo.jpg" alt="" className="size-8 rounded-sm" />
                    <div className="grid leading-tight">
                      <span className="font-mono text-[11px] tracking-[.22em] text-muted-foreground uppercase">Gestão LP</span>
                      <span className="text-xs text-muted-foreground/70">Painel interno</span>
                    </div>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Gestão</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={page === 'pedidos'} tooltip="Pedidos">
                      <a href="/admin/pedidos"><ShoppingBag /><span>Pedidos</span></a>
                    </SidebarMenuButton>
                    {novos > 0 && <SidebarMenuBadge>{novos}</SidebarMenuBadge>}
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={page === 'produtos'} tooltip="Produtos">
                      <a href="/admin/produtos"><Package /><span>Produtos</span></a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Páginas públicas</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Ver loja">
                      <a href={url.home} target="_blank" rel="noreferrer"><Store /><span>Ver loja</span><ExternalLink className="ml-auto size-3 opacity-50" /></a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Catálogo WhatsApp">
                      <a href={url.catalog} target="_blank" rel="noreferrer"><MessageCircle /><span>Catálogo WhatsApp</span><ExternalLink className="ml-auto size-3 opacity-50" /></a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <SidebarMenuButton tooltip="Restaurar dados da demo">
                      <RotateCcw /><span>Restaurar dados da demo</span>
                    </SidebarMenuButton>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Restaurar os dados da demo?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Pedidos, produtos, sacola e login voltam ao que está no banco local (src/data). O que foi feito neste navegador é descartado.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => { resetDemo(); toast.success('Demo restaurada'); }}>Restaurar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </SidebarMenuItem>
            </SidebarMenu>
            <p className="px-2 pb-1 font-mono text-[10px] text-muted-foreground/70 group-data-[collapsible=icon]:hidden">
              Protótipo · dados de demonstração
            </p>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <span className="text-sm text-muted-foreground">Gestão</span>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm font-medium">{titles[page]}</span>
          </header>
          <div className="mx-auto w-full max-w-[1200px] p-4 md:p-8">
            {page === 'pedidos' ? <OrdersPanel /> : <ProductsPanel />}
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster position="bottom-center" />
    </TooltipProvider>
  );
}
