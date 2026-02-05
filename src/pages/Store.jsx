import React from 'react'
import Hero from '../components/Hero'
import Menu from '../components/Menu'
import Notification from '../components/Notification'
import BackToTop from '../components/BackToTop'

export default function Store() {
    return (
        <>
            <Hero />
            <Menu />
            <Notification />
            <BackToTop />
        </>
    )
}
