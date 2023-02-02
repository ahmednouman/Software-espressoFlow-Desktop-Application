import React from 'react'
import WorkspacePreview from './WorkspacePreview'

const WorkspacePreviews = ({ displays }) => {

    return (
        <div className={displays.length === 1 ? "workspace-app-single-preview" : "workspace-app-previews"}>
            {displays && displays.map((display, index) => {
                const apps = display.apps
                const isThereApp = apps.filter(app => app.name !== "")
                if (index < 3 && isThereApp.length > 0) {
                    return (
                        <WorkspacePreview key={`workspace-preview-${index}`} preview={{
                            apps,
                            arrangement: display.arrangement
                        }} />
                    )
                }
            })}
        </div>
    )
}

export default WorkspacePreviews