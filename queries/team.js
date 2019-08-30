const Sequelize = require("sequelize");
const {models} = require("../models");

exports.teamComplete = (escapeRoomId, turnId, order) => {
    const where = {
        // "attributes": [],
        "order": [[{model: models.puzzle, as: "retos"}, "id"]],
        "include": [
            {
                "model": models.turno,
                "attributes": ["startTime"],
                "where": {
                    escapeRoomId
                }
            },
            {
                "model": models.user,
                "as": "teamMembers",
                "attributes": [
                    "name",
                    "surname"
                ]
            },
            {
                "model": models.puzzle,
                "as": "retos",
                "through": {
                    "model": models.retosSuperados
                }
            },
            {
                "model": models.requestedHint,
                "attributes": [
                    "id",
                    "success",
                    "score",
                    "createdAt"
                ],
                // "where": {"success": true},
                "required": false,
                "include": [
                    {
                        "model": models.hint
                    }
                ]
            }
        ]
    };

    if (turnId) {
        where.include[0].where.id = turnId;
    }

    if (order) {
        where.order = [
            Sequelize.literal(order),
            ...where.order
        ];
    }
    return where;
};

exports.puzzlesByTeam = (escapeRoomId, turnId) => {
    const options = {
        "include": [
            {
                "model": models.turno,
                "where": {
                    escapeRoomId
                }
            },
            {
                "model": models.puzzle,
                "as": "retos",
                "through": {"model": models.retosSuperados}
            }
        ],
        "order": Sequelize.literal("lower(team.name) ASC")
    };

    if (turnId) {
        options.include[0].where.id = turnId;
    }
    return options;
};

exports.ranking = (escapeRoomId, turnId) => {
    const options = {
        // "includeIgnoreAttributes": false,
        "attributes": ["name"],
        "include": [
            {
                "model": models.user,
                "as": "teamMembers",
                "attributes": [
                    "name",
                    "surname"
                ],
                "through": {
                    "model": models.members,
                    "duplicating": true,
                    "attributes": []
                }
            },
            {
                "model": models.turno,
                "duplicating": true,
                "attributes": [
                    "id",
                    "date",
                    "startTime"
                ],
                "where": {
                    // "status": {[Sequelize.Op.not]: "pending"},
                    escapeRoomId
                }
            },
            {
                "model": models.puzzle,
                "attributes": ["id"],
                "as": "retos",
                "required": false,
                "duplicating": true,
                "through": {
                    "model": models.retosSuperados,
                    "attributes": ["createdAt"],
                    "required": true
                }
            }
        ]
    };


    if (turnId) {
        options.include[1].where.id = turnId;
    }

    return options;
};