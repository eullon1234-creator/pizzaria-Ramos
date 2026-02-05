import QRCode from 'qrcode'

/**
 * Gera um campo EMV no formato ID+TAMANHO+VALOR
 */
function generateEMVField(id, value) {
    if (!value) return ''
    const size = value.length.toString().padStart(2, '0')
    return `${id}${size}${value}`
}

/**
 * Calcula o CRC16-CCITT do payload PIX
 */
function calculateCRC16(payload) {
    let crc = 0xFFFF
    const bytes = new TextEncoder().encode(payload)
    
    for (let i = 0; i < bytes.length; i++) {
        crc ^= bytes[i] << 8
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ 0x1021
            } else {
                crc = crc << 1
            }
        }
    }
    
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0')
}

/**
 * Remove formatação de chaves PIX (CPF/CNPJ/telefone)
 */
function cleanPixKey(key, keyType) {
    if (keyType === 'cpf' || keyType === 'cnpj' || keyType === 'phone') {
        return key.replace(/\D/g, '')
    }
    return key
}

/**
 * Gera o payload PIX (Copia e Cola) com valor dinâmico
 * Baseado no padrão EMV/BRCode do Banco Central
 * 
 * @param {Object} pixData - Dados do PIX
 * @param {string} pixData.pixKey - Chave PIX (CPF, CNPJ, Email, Telefone ou Aleatória)
 * @param {string} pixData.keyType - Tipo da chave (cpf, cnpj, email, phone, random)
 * @param {string} pixData.holderName - Nome do titular da conta
 * @param {string} pixData.city - Cidade do recebedor
 * @param {number} pixData.amount - Valor da transação em reais
 * @param {string} [pixData.transactionId] - ID único da transação (opcional)
 * @returns {string} Payload PIX (código Copia e Cola)
 */
export function generatePixPayload(pixData) {
    const { pixKey, keyType = 'random', holderName, city = 'Teresina', amount, transactionId } = pixData
    
    // Limpar a chave PIX removendo formatação
    const cleanKey = cleanPixKey(pixKey, keyType)
    
    // 00 - Payload Format Indicator
    let payload = generateEMVField('00', '01')
    
    // 26 - Merchant Account Information
    let merchantAccount = generateEMVField('00', 'BR.GOV.BCB.PIX')
    merchantAccount += generateEMVField('01', cleanKey)
    if (transactionId) {
        merchantAccount += generateEMVField('02', transactionId.substring(0, 25))
    }
    payload += generateEMVField('26', merchantAccount)
    
    // 52 - Merchant Category Code (comércio varejista)
    payload += generateEMVField('52', '0000')
    
    // 53 - Transaction Currency (986 = BRL)
    payload += generateEMVField('53', '986')
    
    // 54 - Transaction Amount
    if (amount && amount > 0) {
        payload += generateEMVField('54', amount.toFixed(2))
    }
    
    // 58 - Country Code
    payload += generateEMVField('58', 'BR')
    
    // 59 - Merchant Name (máximo 25 caracteres)
    const merchantName = holderName.substring(0, 25)
    payload += generateEMVField('59', merchantName)
    
    // 60 - Merchant City (máximo 15 caracteres)
    const merchantCity = city.substring(0, 15)
    payload += generateEMVField('60', merchantCity)
    
    // 62 - Additional Data Field Template (opcional)
    if (transactionId) {
        let additionalData = generateEMVField('05', transactionId.substring(0, 25))
        payload += generateEMVField('62', additionalData)
    }
    
    // 63 - CRC16 (calculado sobre todo o payload + "6304")
    payload += '6304'
    const crc = calculateCRC16(payload)
    payload += crc
    
    return payload
}

/**
 * Gera a imagem do QR Code PIX em base64
 * @param {string} payload - Payload PIX (código Copia e Cola)
 * @returns {Promise<string>} URL da imagem em base64
 */
export async function generatePixQRCode(payload) {
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(payload, {
            errorCorrectionLevel: 'M',
            margin: 1,
            width: 400,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        })
        return qrCodeDataUrl
    } catch (error) {
        console.error('Erro ao gerar QR Code:', error)
        throw error
    }
}

/**
 * Gera o QR Code PIX completo (payload + imagem)
 * @param {Object} pixData - Dados do PIX (mesmos parâmetros de generatePixPayload)
 * @returns {Promise<Object>} Objeto com payload e qrCodeDataUrl
 */
export async function generateDynamicPixQRCode(pixData) {
    const payload = generatePixPayload(pixData)
    const qrCodeDataUrl = await generatePixQRCode(payload)
    
    return {
        payload,
        qrCodeDataUrl
    }
}
