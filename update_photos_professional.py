"""
Script para ATUALIZAR para IMAGENS FOTOGRÁFICAS REAIS e DESIGN DE LUXO
Substitui as artes digitais por fotos de alta gastronomia.
"""

import urllib.request
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def download_image(url, filename):
    print(f"⬇️  Baixando foto profissional: {filename}...")
    try:
        # User-Agent para evitar bloqueios
        opener = urllib.request.build_opener()
        opener.addheaders = [('User-agent', 'Mozilla/5.0')]
        urllib.request.install_opener(opener)
        
        urllib.request.urlretrieve(url, os.path.join('public', filename))
        print(f"✅ Foto salva com sucesso: public/{filename}")
        return True
    except Exception as e:
        print(f"❌ Erro ao baixar {filename}: {e}")
        return False

def create_luxury_icon(size, filename):
    """Cria um ícone de LUXO minimalista (sem emojis)"""
    print(f"🎨 Criando ícone de luxo: {filename}...")
    
    # Fundo Vermelho Nobre (Bordo/Vinho profundo)
    img = Image.new('RGB', (size, size), color='#1a0505') # Quase preto/vinho
    draw = ImageDraw.Draw(img)
    
    # Gradiente sutil
    center = size // 2
    for i in range(size):
        alpha = int(255 * (1 - (i / size)))
        # Um vermelho um pouco mais vivo no centro
        color = (139, 0, 0) # DarkRed
    
    # Desenhar círculo de fundo gradiente (simulado)
    draw.ellipse([0, 0, size, size], fill='#8B0000')
    draw.ellipse([size*0.1, size*0.1, size*0.9, size*0.9], fill='#600000') # Centro mais escuro para contraste
    
    # Borda Dourada Dupla (Estilo Premium)
    gold_color = '#FFD700' # Dourado
    draw.rectangle([size*0.05, size*0.05, size*0.95, size*0.95], outline=gold_color, width=max(1, size//40))
    draw.rectangle([size*0.08, size*0.08, size*0.92, size*0.92], outline=gold_color, width=max(1, size//100))
    
    # Monograma "R" ou "Ramos" Estilizado
    try:
        # Tentar fontes serifadas elegantes
        fonts = [
            "timesbd.ttf", "times.ttf",  # Times New Roman
            "georgiab.ttf", "georgia.ttf", # Georgia
            "C:\\Windows\\Fonts\\timesbd.ttf",
            "C:\\Windows\\Fonts\\georgiab.ttf"
        ]
        
        font = None
        font_size = int(size * 0.5)
        
        for f in fonts:
            try:
                font = ImageFont.truetype(f, font_size)
                break
            except:
                continue
                
        if font is None:
            font = ImageFont.load_default()

        text = "R"
        
        # Centralizar
        bbox = draw.textbbox((0, 0), text, font=font)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        
        # Sombra sutil
        shadow_off = max(1, size // 50)
        draw.text(((size-w)/2 + shadow_off, (size-h)/2 + shadow_off - size*0.05), text, font=font, fill='#000000')
        
        # Texto Dourado
        draw.text(((size-w)/2, (size-h)/2 - size*0.05), text, font=font, fill=gold_color)
        
        # Nome "RAMOS" menor embaixo
        small_font_size = int(size * 0.12)
        small_font = None
        for f in ["arialbd.ttf", "arial.ttf"]:
            try:
                small_font = ImageFont.truetype(f, small_font_size)
                break
            except:
                continue
        
        if small_font:
            small_text = "PIZZARIA"
            bbox2 = draw.textbbox((0, 0), small_text, font=small_font)
            w2 = bbox2[2] - bbox2[0]
            draw.text(((size-w2)/2, size*0.75), small_text, font=small_font, fill='#FFFFFF', spacing=4)

    except Exception as e:
        print(f"Erro na tipografia: {e}")

    output_path = os.path.join('public', filename)
    img.save(output_path, 'PNG', quality=100)
    print(f"✅ Ícone salvo: {output_path}")

def main():
    if not os.path.exists('public'):
        os.makedirs('public')

    print("="*50)
    print("📸 ATUALIZANDO IDENTIDADE VISUAL - PROJEÇÃO PREMIUM")
    print("="*50)

    # 1. BANNERS REAIS (Fotos de Unsplash de alta qualidade)
    
    # URL de uma pizza artesanal em forno a lenha, iluminação escura e quente (Banner Desktop)
    # Foto por: Ivan Torres (Unsplash) - Pizza Pepperoni Dark Mood
    BANNER_DESKTOP = "https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=85&w=1920&auto=format&fit=crop"
    
    # URL de uma pizza vertical close-up (Banner Mobile / Entrada)
    # Foto por: Fernado Andrade (Unsplash) - Pizza Slice Vertical
    BANNER_MOBILE = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=85&w=1080&auto=format&fit=crop"

    download_image(BANNER_DESKTOP, 'hero-bg.jpg')
    download_image(BANNER_MOBILE, 'hero-bg-mobile.jpg')

    # 2. ÍCONES DE LUXO (Sem emojis)
    create_luxury_icon(192, 'pwa-192x192.png')
    create_luxury_icon(512, 'pwa-512x512.png')

    print("\n✅ Concluído! Imagens atualizadas para versão PROFISSIONAL REAL.")
    print("Execute 'npm run build' e 'npm run preview' para ver.")

if __name__ == "__main__":
    main()
