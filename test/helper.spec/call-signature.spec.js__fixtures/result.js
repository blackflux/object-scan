module.exports = {
  haystack: {
    parent: {
      children: [
        {
          property: 'A'
        },
        {
          property: 'B'
        }
      ]
    }
  },
  needles: [
    '**'
  ],
  useArraySelector: true,
  logs: [
    {
      cbName: 'breakFn',
      key: '',
      value: {
        parent: {
          children: [
            {
              property: 'A'
            },
            {
              property: 'B'
            }
          ]
        }
      },
      parent: undefined,
      parents: [],
      isMatch: false,
      matchedBy: [],
      excludedBy: [],
      traversedBy: [
        '**'
      ],
      isCircular: false
    },
    {
      cbName: 'breakFn',
      key: 'parent',
      value: {
        children: [
          {
            property: 'A'
          },
          {
            property: 'B'
          }
        ]
      },
      parent: {
        parent: {
          children: [
            {
              property: 'A'
            },
            {
              property: 'B'
            }
          ]
        }
      },
      parents: [
        {
          parent: {
            children: [
              {
                property: 'A'
              },
              {
                property: 'B'
              }
            ]
          }
        }
      ],
      isMatch: true,
      matchedBy: [
        '**'
      ],
      excludedBy: [],
      traversedBy: [
        '**'
      ],
      isCircular: false
    },
    {
      cbName: 'breakFn',
      key: 'parent.children',
      value: [
        {
          property: 'A'
        },
        {
          property: 'B'
        }
      ],
      parent: {
        children: [
          {
            property: 'A'
          },
          {
            property: 'B'
          }
        ]
      },
      parents: [
        {
          children: [
            {
              property: 'A'
            },
            {
              property: 'B'
            }
          ]
        },
        {
          parent: {
            children: [
              {
                property: 'A'
              },
              {
                property: 'B'
              }
            ]
          }
        }
      ],
      isMatch: true,
      matchedBy: [
        '**'
      ],
      excludedBy: [],
      traversedBy: [
        '**'
      ],
      isCircular: false
    },
    {
      cbName: 'breakFn',
      key: 'parent.children[1]',
      value: {
        property: 'B'
      },
      parent: [
        {
          property: 'A'
        },
        {
          property: 'B'
        }
      ],
      parents: [
        [
          {
            property: 'A'
          },
          {
            property: 'B'
          }
        ],
        {
          children: [
            {
              property: 'A'
            },
            {
              property: 'B'
            }
          ]
        },
        {
          parent: {
            children: [
              {
                property: 'A'
              },
              {
                property: 'B'
              }
            ]
          }
        }
      ],
      isMatch: true,
      matchedBy: [
        '**'
      ],
      excludedBy: [],
      traversedBy: [
        '**'
      ],
      isCircular: false
    },
    {
      cbName: 'breakFn',
      key: 'parent.children[1].property',
      value: 'B',
      parent: {
        property: 'B'
      },
      parents: [
        {
          property: 'B'
        },
        [
          {
            property: 'A'
          },
          {
            property: 'B'
          }
        ],
        {
          children: [
            {
              property: 'A'
            },
            {
              property: 'B'
            }
          ]
        },
        {
          parent: {
            children: [
              {
                property: 'A'
              },
              {
                property: 'B'
              }
            ]
          }
        }
      ],
      isMatch: true,
      matchedBy: [
        '**'
      ],
      excludedBy: [],
      traversedBy: [
        '**'
      ],
      isCircular: false
    },
    {
      cbName: 'filterFn',
      key: 'parent.children[1].property',
      value: 'B',
      parent: {
        property: 'B'
      },
      parents: [
        {
          property: 'B'
        },
        [
          {
            property: 'A'
          },
          {
            property: 'B'
          }
        ],
        {
          children: [
            {
              property: 'A'
            },
            {
              property: 'B'
            }
          ]
        },
        {
          parent: {
            children: [
              {
                property: 'A'
              },
              {
                property: 'B'
              }
            ]
          }
        }
      ],
      isMatch: true,
      matchedBy: [
        '**'
      ],
      excludedBy: [],
      traversedBy: [
        '**'
      ],
      isCircular: false
    },
    {
      cbName: 'filterFn',
      key: 'parent.children[1]',
      value: {
        property: 'B'
      },
      parent: [
        {
          property: 'A'
        },
        {
          property: 'B'
        }
      ],
      parents: [
        [
          {
            property: 'A'
          },
          {
            property: 'B'
          }
        ],
        {
          children: [
            {
              property: 'A'
            },
            {
              property: 'B'
            }
          ]
        },
        {
          parent: {
            children: [
              {
                property: 'A'
              },
              {
                property: 'B'
              }
            ]
          }
        }
      ],
      isMatch: true,
      matchedBy: [
        '**'
      ],
      excludedBy: [],
      traversedBy: [
        '**'
      ],
      isCircular: false
    },
    {
      cbName: 'breakFn',
      key: 'parent.children[0]',
      value: {
        property: 'A'
      },
      parent: [
        {
          property: 'A'
        },
        {
          property: 'B'
        }
      ],
      parents: [
        [
          {
            property: 'A'
          },
          {
            property: 'B'
          }
        ],
        {
          children: [
            {
              property: 'A'
            },
            {
              property: 'B'
            }
          ]
        },
        {
          parent: {
            children: [
              {
                property: 'A'
              },
              {
                property: 'B'
              }
            ]
          }
        }
      ],
      isMatch: true,
      matchedBy: [
        '**'
      ],
      excludedBy: [],
      traversedBy: [
        '**'
      ],
      isCircular: false
    },
    {
      cbName: 'breakFn',
      key: 'parent.children[0].property',
      value: 'A',
      parent: {
        property: 'A'
      },
      parents: [
        {
          property: 'A'
        },
        [
          {
            property: 'A'
          },
          {
            property: 'B'
          }
        ],
        {
          children: [
            {
              property: 'A'
            },
            {
              property: 'B'
            }
          ]
        },
        {
          parent: {
            children: [
              {
                property: 'A'
              },
              {
                property: 'B'
              }
            ]
          }
        }
      ],
      isMatch: true,
      matchedBy: [
        '**'
      ],
      excludedBy: [],
      traversedBy: [
        '**'
      ],
      isCircular: false
    },
    {
      cbName: 'filterFn',
      key: 'parent.children[0].property',
      value: 'A',
      parent: {
        property: 'A'
      },
      parents: [
        {
          property: 'A'
        },
        [
          {
            property: 'A'
          },
          {
            property: 'B'
          }
        ],
        {
          children: [
            {
              property: 'A'
            },
            {
              property: 'B'
            }
          ]
        },
        {
          parent: {
            children: [
              {
                property: 'A'
              },
              {
                property: 'B'
              }
            ]
          }
        }
      ],
      isMatch: true,
      matchedBy: [
        '**'
      ],
      excludedBy: [],
      traversedBy: [
        '**'
      ],
      isCircular: false
    },
    {
      cbName: 'filterFn',
      key: 'parent.children[0]',
      value: {
        property: 'A'
      },
      parent: [
        {
          property: 'A'
        },
        {
          property: 'B'
        }
      ],
      parents: [
        [
          {
            property: 'A'
          },
          {
            property: 'B'
          }
        ],
        {
          children: [
            {
              property: 'A'
            },
            {
              property: 'B'
            }
          ]
        },
        {
          parent: {
            children: [
              {
                property: 'A'
              },
              {
                property: 'B'
              }
            ]
          }
        }
      ],
      isMatch: true,
      matchedBy: [
        '**'
      ],
      excludedBy: [],
      traversedBy: [
        '**'
      ],
      isCircular: false
    },
    {
      cbName: 'filterFn',
      key: 'parent.children',
      value: [
        {
          property: 'A'
        },
        {
          property: 'B'
        }
      ],
      parent: {
        children: [
          {
            property: 'A'
          },
          {
            property: 'B'
          }
        ]
      },
      parents: [
        {
          children: [
            {
              property: 'A'
            },
            {
              property: 'B'
            }
          ]
        },
        {
          parent: {
            children: [
              {
                property: 'A'
              },
              {
                property: 'B'
              }
            ]
          }
        }
      ],
      isMatch: true,
      matchedBy: [
        '**'
      ],
      excludedBy: [],
      traversedBy: [
        '**'
      ],
      isCircular: false
    },
    {
      cbName: 'filterFn',
      key: 'parent',
      value: {
        children: [
          {
            property: 'A'
          },
          {
            property: 'B'
          }
        ]
      },
      parent: {
        parent: {
          children: [
            {
              property: 'A'
            },
            {
              property: 'B'
            }
          ]
        }
      },
      parents: [
        {
          parent: {
            children: [
              {
                property: 'A'
              },
              {
                property: 'B'
              }
            ]
          }
        }
      ],
      isMatch: true,
      matchedBy: [
        '**'
      ],
      excludedBy: [],
      traversedBy: [
        '**'
      ],
      isCircular: false
    }
  ],
  result: [
    'parent.children[1].property',
    'parent.children[1]',
    'parent.children[0].property',
    'parent.children[0]',
    'parent.children',
    'parent'
  ]
};
