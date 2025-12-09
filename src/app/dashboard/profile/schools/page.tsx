'use client';

import {TargetSchoolsPage} from '@/components/dashboard/Profile/TargetSchoolsPage';
import AuthHeader from '@/components/dashboard/AuthHeader';

export default function TargetSchools() {
    return (
        <>
            <AuthHeader/>
            <TargetSchoolsPage/>
        </>
    );
}

