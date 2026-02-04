"""
Script para gerar imagem HERO profissional para Pizzaria Ramos
Imagem de entrada do app com design moderno e chamativo
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import os

def create_hero_image():
    """Cria uma imagem hero 1920x1080 profissional"""
    width, height = 1920, 1080
    
    # Criar fundo com gradiente diagonal elegante
    img = Image.new('RGB', (width, height), color='#000000')
    draw = ImageDraw.Draw(img)
    
    # Gradiente diagonal do vermelho escuro para vermelho vibrante
    for y in range(height):
        for x in range(width):
            # Calcular distância do canto superior esquerdo
            distance = ((x / width) + (y / height)) / 2
            
            # Interpolar cores
            r1, g1, b1 = 139, 0, 0      # #8B0000 (Dark Red)
            r2, g2, b2 = 220, 38, 38    # #dc2626 (Red)
            
            r = int(r1 + (r2 - r1) * distance)
            g = int(g1 + (g2 - g1) * distance)
            b = int(b1 + (b2 - b1) * distance)
            
            img.putpixel((x, y), (r, g, b))
    
    # Adicionar padrão sutil de textura
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    
    # Adicionar círculos decorativos translúcidos
    circle_positions = [
        (width * 0.1, height * 0.2, 300),
        (width * 0.85, height * 0.7, 400),
        (width * 0.3, height * 0.8, 250),
        (width * 0.7, height * 0.15, 350),
    ]
    
    for x, y, size in circle_positions:
        overlay_draw.ellipse([x - size/2, y - size/2, x + size/2, y + size/2],
                            fill=(255, 215, 0, 20))  # Dourado translúcido
    
    overlay = overlay.filter(ImageFilter.GaussianBlur(80))
    img.paste(overlay, (0, 0), overlay)
    
    # Adicionar retângulo central semi-transparente para destaque
    center_box = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    center_draw = ImageDraw.Draw(center_box)
    
    box_width = int(width * 0.7)
    box_height = int(height * 0.5)
    box_x = (width - box_width) // 2
    box_y = (height - box_height) // 2
    
    # Sombra do box
    shadow_offset = 20
    center_draw.rounded_rectangle(
        [box_x + shadow_offset, box_y + shadow_offset, 
         box_x + box_width + shadow_offset, box_y + box_height + shadow_offset],
        radius=30, fill=(0, 0, 0, 100)
    )
    
    # Box principal
    center_draw.rounded_rectangle(
        [box_x, box_y, box_x + box_width, box_y + box_height],
        radius=30, fill=(255, 215, 0, 230), outline=(212, 175, 55, 255), width=6
    )
    
    img.paste(center_box, (0, 0), center_box)
    draw = ImageDraw.Draw(img)
    
    # Adicionar emoji de pizza GIGANTE
    try:
        emoji_size = 280
        emoji_fonts = [
            "seguiemj.ttf",
            "C:\\Windows\\Fonts\\seguiemj.ttf",
            "C:\\Windows\\Fonts\\Segoe UI Emoji.ttf",
        ]
        
        emoji_font = None
        for font_path in emoji_fonts:
            try:
                emoji_font = ImageFont.truetype(font_path, emoji_size)
                break
            except:
                continue
        
        if emoji_font:
            pizza_emoji = "🍕"
            bbox = draw.textbbox((0, 0), pizza_emoji, font=emoji_font)
            emoji_width = bbox[2] - bbox[0]
            emoji_x = (width - emoji_width) // 2 - bbox[0]
            emoji_y = box_y + 60
            
            draw.text((emoji_x, emoji_y), pizza_emoji, font=emoji_font, embedded_color=True)
    except Exception as e:
        print(f"⚠️  Emoji não adicionado: {e}")
    
    # Adicionar texto "PIZZARIA RAMOS"
    try:
        # Título principal
        title_size = 140
        title_fonts = [
            "impact.ttf",
            "C:\\Windows\\Fonts\\impact.ttf",
            "arialbd.ttf",
            "C:\\Windows\\Fonts\\arialbd.ttf",
        ]
        
        title_font = None
        for font_path in title_fonts:
            try:
                title_font = ImageFont.truetype(font_path, title_size)
                break
            except:
                continue
        
        if title_font is None:
            title_font = ImageFont.load_default()
        
        title_text = "PIZZARIA"
        bbox = draw.textbbox((0, 0), title_text, font=title_font)
        title_width = bbox[2] - bbox[0]
        title_x = (width - title_width) // 2 - bbox[0]
        title_y = box_y + box_height // 2 - 40
        
        # Sombra do título
        draw.text((title_x + 4, title_y + 4), title_text, fill='#8B0000', font=title_font)
        # Título principal
        draw.text((title_x, title_y), title_text, fill='#8B0000', font=title_font)
        
        # Subtítulo "RAMOS"
        brand_size = 180
        brand_font = None
        for font_path in title_fonts:
            try:
                brand_font = ImageFont.truetype(font_path, brand_size)
                break
            except:
                continue
        
        if brand_font is None:
            brand_font = ImageFont.load_default()
        
        brand_text = "RAMOS"
        bbox = draw.textbbox((0, 0), brand_text, font=brand_font)
        brand_width = bbox[2] - bbox[0]
        brand_x = (width - brand_width) // 2 - bbox[0]
        brand_y = title_y + 120
        
        # Sombra do brand
        draw.text((brand_x + 5, brand_y + 5), brand_text, fill='#8B0000', font=brand_font)
        # Brand principal
        draw.text((brand_x, brand_y), brand_text, fill='#FFFFFF', font=brand_font)
        
    except Exception as e:
        print(f"⚠️  Texto não adicionado: {e}")
    
    # Adicionar tagline na parte inferior
    try:
        tagline_size = 50
        tagline_font = None
        for font_path in ["arial.ttf", "C:\\Windows\\Fonts\\arial.ttf"]:
            try:
                tagline_font = ImageFont.truetype(font_path, tagline_size)
                break
            except:
                continue
        
        if tagline_font:
            tagline = "O Sabor que Você Ama! 🔥"
            bbox = draw.textbbox((0, 0), tagline, font=tagline_font)
            tagline_width = bbox[2] - bbox[0]
            tagline_x = (width - tagline_width) // 2 - bbox[0]
            tagline_y = box_y + box_height - 100
            
            # Sombra
            draw.text((tagline_x + 2, tagline_y + 2), tagline, fill='#8B0000', font=tagline_font)
            # Texto principal
            draw.text((tagline_x, tagline_y), tagline, fill='#FFFFFF', font=tagline_font)
    except Exception as e:
        print(f"⚠️  Tagline não adicionada: {e}")
    
    # Salvar imagem
    output_path = os.path.join('public', 'hero-bg.jpg')
    
    # Aplicar leve nitidez para qualidade profissional
    enhancer = ImageEnhance.Sharpness(img)
    img = enhancer.enhance(1.2)
    
    img.save(output_path, 'JPEG', quality=95, optimize=True)
    print(f"✅ Imagem HERO profissional criada: {output_path}")
    
    # Criar também uma versão mobile (mais estreita)
    mobile_img = img.resize((1080, 1920), Image.Resampling.LANCZOS)
    mobile_path = os.path.join('public', 'hero-bg-mobile.jpg')
    mobile_img.save(mobile_path, 'JPEG', quality=90, optimize=True)
    print(f"✅ Imagem HERO MOBILE criada: {mobile_path}")

def main():
    if not os.path.exists('public'):
        os.makedirs('public')
    
    print("=" * 60)
    print("🎨 GERANDO IMAGEM HERO PROFISSIONAL - PIZZARIA RAMOS")
    print("=" * 60)
    print("\n🖼️  Criando design com:")
    print("  • Gradiente diagonal elegante")
    print("  • Círculos decorativos dourados")
    print("  • Box central com sombra")
    print("  • Pizza emoji gigante")
    print("  • Tipografia impactante")
    print("  • Versões desktop e mobile\n")
    
    create_hero_image()
    
    print("\n" + "=" * 60)
    print("🎉 IMAGEM HERO PROFISSIONAL CRIADA!")
    print("=" * 60)
    print("\n📸 Arquivos gerados:")
    print("  • public/hero-bg.jpg (1920x1080 - Desktop)")
    print("  • public/hero-bg-mobile.jpg (1080x1920 - Mobile)")
    print("\n💡 Para usar, edite src/components/Hero.jsx\n")

if __name__ == "__main__":
    try:
        main()
    except ImportError:
        print("❌ Erro: Biblioteca Pillow não encontrada")
        print("📦 Instale com: pip install Pillow")
