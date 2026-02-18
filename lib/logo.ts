export const getLogoUrl = (companyName: string) => {
    // Basic mapping for known companies in the database
    const mapping: Record<string, string> = {
        'McKesson': 'mckesson.com',
        'AmerisourceBergen': 'amerisourcebergen.com',
        'Cencora': 'cencora.com', // AmerisourceBergen is now Cencora
        'Cardinal Health': 'cardinalhealth.com',
        'Henry Schein': 'henryschein.com',
        'Owens & Minor': 'owens-minor.com',
        'Medline Industries': 'medline.com',
        'Concordance Healthcare': 'concordancehealthcare.com',
        'Vizient': 'vizientinc.com',
        'Invacare': 'invacare.com',
        'Stryker': 'stryker.com',
        'Stryker Corporation': 'stryker.com'
    }

    const domain = mapping[companyName] || `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
    const token = process.env.NEXT_PUBLIC_LOGODEV_SECRET

    return `https://img.logo.dev/${domain}?token=${token}`
}
