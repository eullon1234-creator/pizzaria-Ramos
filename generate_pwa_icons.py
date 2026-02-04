"""
Script para gerar ícones PWA temporários/placeholder
Para ícones profissionais, veja PWA_ICONS_GUIDE.md
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_pwa_icon(size, filename):
    """Cria um ícone PWA simples com fundo vermelho"""
    # Criar imagem com fundo vermelho da pizzaria
    img = Image.new('RGB', (size, size), color='#dc2626')
    draw = ImageDraw.Draw(img)
    
    # Adicionar círculo amarelo no centro
    circle_size = size // 2
    circle_pos = size // 4
    draw.ellipse([circle_pos, circle_pos, circle_pos + circle_size, circle_pos + circle_size], 
                 fill='#FFD700', outline='#D4AF37', width=size//50)
    
    # Adicionar emoji de pizza no centro (simplificado)
    try:
        # Tentar usar uma fonte do sistema
        font_size = size // 3
        try:
            font = ImageFont.truetype("seguiemj.ttf", font_size)  # Windows emoji font
        except:
            try:
                font = ImageFont.truetype("arial.ttf", font_size)
            except:
                font = ImageFont.load_default()
        
        text = "🍕"
        
        # Calcular posição central
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        position = ((size - text_width) // 2, (size - text_height) // 2 - size//10)
        
        draw.text(position, text, fill='#dc2626', font=font)
        
    except Exception as e:
        print(f"Aviso: Não foi possível adicionar emoji: {e}")
        # Fallback: apenas desenhar um círculo menor no centro
        center = size // 2
        small_circle = size // 8
        draw.ellipse([center - small_circle, center - small_circle, 
                     center + small_circle, center + small_circle], 
                     fill='#dc2626')
    
    # Salvar na pasta public
    output_path = os.path.join('public', filename)
    img.save(output_path, 'PNG', quality=95)
    print(f"✓ Ícone criado: {output_path}")

def main():
    # Verificar se a pasta public existe
    if not os.path.exists('public'):
        os.makedirs('public')
        print("✓ Pasta 'public' criada")
    
    print("Gerando ícones PWA temporários...")
    print("(Para ícones profissionais, veja PWA_ICONS_GUIDE.md)\n")
    
    # Criar os ícones
    create_pwa_icon(192, 'pwa-192x192.png')
    create_pwa_icon(512, 'pwa-512x512.png')
    
    print("\n✅ Ícones temporários criados com sucesso!")
    print("⚠️  IMPORTANTE: Substitua estes ícones por versões profissionais")
    print("📖 Veja PWA_ICONS_GUIDE.md para instruções detalhadas\n")

if __name__ == "__main__":
    try:
        main()
    except ImportError:
        print("❌ Erro: Biblioteca Pillow não encontrada")
        print("📦 Instale com: pip install Pillow")
        print("\nOu crie os ícones manualmente seguindo PWA_ICONS_GUIDE.md")
