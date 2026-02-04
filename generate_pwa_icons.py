"""
Script para gerar ícones PWA PROFISSIONAIS para Pizzaria Ramos
Design moderno com gradiente, texto estilizado e elementos visuais
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

def create_gradient_background(size):
    """Cria um fundo com gradiente vermelho profissional"""
    img = Image.new('RGB', (size, size), color='#dc2626')
    draw = ImageDraw.Draw(img)
    
    # Criar gradiente radial do centro para as bordas
    for i in range(size // 2):
        # Gradiente de vermelho escuro para vermelho vibrante
        r = int(220 - (i * 0.15))  # Diminui vermelho gradualmente
        g = int(38 + (i * 0.05))   # Aumenta um pouco o verde
        b = int(38 + (i * 0.05))   # Aumenta um pouco o azul
        
        r = max(139, min(220, r))  # Limitar entre #8B0000 e #dc2626
        color = f'#{r:02x}{g:02x}{b:02x}'
        
        center = size // 2
        draw.ellipse([center - i, center - i, center + i, center + i], 
                    fill=color, outline=color)
    
    return img

def create_pwa_icon(size, filename):
    """Cria um ícone PWA PROFISSIONAL com design moderno"""
    # Criar fundo com gradiente
    img = create_gradient_background(size)
    draw = ImageDraw.Draw(img)
    
    # Adicionar círculo dourado de fundo (sutil)
    circle_size = int(size * 0.7)
    circle_pos = (size - circle_size) // 2
    
    # Sombra do círculo (blur effect)
    shadow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_offset = int(size * 0.02)
    shadow_draw.ellipse([circle_pos + shadow_offset, circle_pos + shadow_offset, 
                         circle_pos + circle_size + shadow_offset, 
                         circle_pos + circle_size + shadow_offset], 
                        fill=(0, 0, 0, 60))
    shadow = shadow.filter(ImageFilter.GaussianBlur(size // 40))
    img.paste(shadow, (0, 0), shadow)
    
    # Círculo dourado principal
    draw.ellipse([circle_pos, circle_pos, 
                  circle_pos + circle_size, circle_pos + circle_size], 
                 fill='#FFD700', outline='#D4AF37', width=max(3, size//100))
    
    # Adicionar emoji de pizza (GRANDE e centralizado)
    try:
        # Tentar fontes de emoji do Windows
        font_size = int(size * 0.35)
        font = None
        emoji_fonts = [
            "seguiemj.ttf",      # Windows 10/11
            "C:\\Windows\\Fonts\\seguiemj.ttf",
            "C:\\Windows\\Fonts\\Segoe UI Emoji.ttf",
        ]
        
        for font_path in emoji_fonts:
            try:
                font = ImageFont.truetype(font_path, font_size)
                break
            except:
                continue
        
        if font is None:
            # Fallback para Arial Bold
            font = ImageFont.truetype("arialbd.ttf", font_size)
        
        text = "🍕"
        
        # Calcular posição central precisa
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Centralizar emoji
        x = (size - text_width) // 2 - bbox[0]
        y = int(size * 0.25) - bbox[1]  # Posicionar um pouco acima do centro
        
        draw.text((x, y), text, font=font, embedded_color=True)
        
    except Exception as e:
        print(f"⚠️  Emoji não disponível: {e}")
        # Fallback: desenhar forma de pizza estilizada
        pizza_size = int(size * 0.3)
        pizza_x = (size - pizza_size) // 2
        pizza_y = int(size * 0.25)
        draw.ellipse([pizza_x, pizza_y, pizza_x + pizza_size, pizza_y + pizza_size],
                    fill='#FFA500', outline='#FF8C00', width=max(2, size//150))
    
    # Adicionar texto "RAMOS" abaixo
    try:
        text_size = int(size * 0.14)
        text_fonts = [
            "arialbd.ttf",       # Arial Bold
            "C:\\Windows\\Fonts\\arialbd.ttf",
            "C:\\Windows\\Fonts\\Arial Bold.ttf",
            "impact.ttf",        # Impact
            "C:\\Windows\\Fonts\\impact.ttf",
        ]
        
        text_font = None
        for font_path in text_fonts:
            try:
                text_font = ImageFont.truetype(font_path, text_size)
                break
            except:
                continue
        
        if text_font is None:
            text_font = ImageFont.load_default()
        
        brand_text = "RAMOS"
        
        # Calcular posição do texto
        bbox = draw.textbbox((0, 0), brand_text, font=text_font)
        text_width = bbox[2] - bbox[0]
        text_x = (size - text_width) // 2 - bbox[0]
        text_y = int(size * 0.68)
        
        # Sombra do texto
        shadow_offset = max(2, size // 200)
        draw.text((text_x + shadow_offset, text_y + shadow_offset), 
                 brand_text, fill='#8B0000', font=text_font)
        
        # Texto principal em branco/dourado
        draw.text((text_x, text_y), brand_text, fill='#FFFFFF', font=text_font)
        
    except Exception as e:
        print(f"⚠️  Texto RAMOS não adicionado: {e}")
    
    # Adicionar borda sutil ao redor (acabamento profissional)
    border_width = max(2, size // 150)
    draw.rectangle([0, 0, size-1, size-1], 
                  outline='#8B0000', width=border_width)
    
    # Salvar na pasta public
    output_path = os.path.join('public', filename)
    img.save(output_path, 'PNG', quality=100, optimize=True)
    print(f"✅ Ícone PROFISSIONAL criado: {output_path}")

def main():
    # Verificar se a pasta public existe
    if not os.path.exists('public'):
        os.makedirs('public')
        print("✓ Pasta 'public' criada")
    
    print("=" * 60)
    print("🎨 GERANDO ÍCONES PWA PROFISSIONAIS - PIZZARIA RAMOS")
    print("=" * 60)
    print("\n📐 Criando design com:")
    print("  • Gradiente vermelho moderno")
    print("  • Círculo dourado com sombra")
    print("  • Pizza emoji grande e centralizada")
    print("  • Texto 'RAMOS' estilizado")
    print("  • Bordas e acabamento profissional\n")
    
    # Criar os ícones
    create_pwa_icon(192, 'pwa-192x192.png')
    create_pwa_icon(512, 'pwa-512x512.png')
    
    print("\n" + "=" * 60)
    print("🎉 ÍCONES PROFISSIONAIS CRIADOS COM SUCESSO!")
    print("=" * 60)
    print("\n📱 Teste agora:")
    print("  1. npm run build")
    print("  2. npm run preview")
    print("  3. Veja os ícones no navegador\n")

if __name__ == "__main__":
    try:
        main()
    except ImportError:
        print("❌ Erro: Biblioteca Pillow não encontrada")
        print("📦 Instale com: pip install Pillow")
        print("\nOu crie os ícones manualmente seguindo PWA_ICONS_GUIDE.md")
