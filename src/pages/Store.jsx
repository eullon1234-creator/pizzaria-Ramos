import React from 'react'
import Hero from '../components/Hero'
import WhyChooseUs from '../components/WhyChooseUs'
import Testimonials from '../components/Testimonials'
import Menu from '../components/Menu'
import Notification from '../components/Notification'
import BackToTop from '../components/BackToTop'

export default function Store() {
    return (
        <>
            <Hero />
            <WhyChooseUs />
            <Menu />
            <Testimonials />
            <Notification />
            <BackToTop />
        </>
    )
}
