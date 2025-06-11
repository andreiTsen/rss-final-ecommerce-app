  import { CartService } from "../../services/cartService"; 
  type CartItem = {
      id: number
      name: string
      price: number
      quantity: number
  }
 export class ShoppingCartPage {
      public element?: HTMLElement;
      public cartItems: CartItem[] = []
      public loading: boolean = true
      public error: string | null = null

      constructor() {
          void this.fetchCartItems()
      }

      public get totalPrice(): number {
          return this.cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
      }

      public async fetchCartItems(): Promise<void> {
          try {
              const response = await fetch('/api/cart')
              if (!response.ok) {
                  throw new Error('Failed to fetch cart items')
              }
              const data = await response.json()
              this.cartItems = data
          } catch (error) {
              this.error = error instanceof Error ? error.message : 'Unknown error'
          } finally {
              this.loading = false
              this.render()
          }
      }

      public render(): void {
        const main = document.getElementById('app')
        if (main) {
            main.innerHTML = '';
            const container = document.createElement('div');
            container.classList.add('container');
            const title = document.createElement('h2');
            title.textContent = 'Shopping Cart';
            container.appendChild(title);
            
            
            main.appendChild(container);
            console.log('Rendering cart items...')
        }
      }
  }

  new ShoppingCartPage()