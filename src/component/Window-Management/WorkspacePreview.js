import React from 'react'
import { baseImagePath } from '../../utils/utility'

const WorkspacePreview = ({ preview }) => {
    const { apps, arrangement } = preview

    return (
        <div className={arrangement === "maximize" ? "workspace-app-preview-maximize" : arrangement === "verticalSplit" ? "workspace-app-preview-horizontal" : "workspace-app-preview-vertical"}>
            {apps.map((app, index) => {
                if (app.name === "") {
                    return (
                        <div
                            key={`${app.name}-${index}`} className="workspace-preview-icon-empty" />
                    )

                } else {
                    return (
                        <img key={`${app.name}-${index}`} className="workspace-preview-icon" src={app.icon.search("tabGroup") > -1 ? baseImagePath('icons/tabGroup.svg') : app.icon} alt={app.name} />
                    )
                }
            })}
        </div>
    )
}

export default WorkspacePreview