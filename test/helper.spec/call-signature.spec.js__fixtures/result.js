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
  reverse: true,
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
      isCircular: false,
      isLeaf: false,
      depth: 0,
      result: []
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
      isCircular: false,
      isLeaf: false,
      depth: 1,
      result: []
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
      isCircular: false,
      isLeaf: false,
      depth: 2,
      result: []
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
      isCircular: false,
      isLeaf: false,
      depth: 3,
      result: []
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
      isCircular: false,
      isLeaf: true,
      depth: 4,
      result: []
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
      isCircular: false,
      isLeaf: true,
      depth: 4,
      result: []
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
      isCircular: false,
      isLeaf: false,
      depth: 3,
      result: [
        'parent.children[1].property'
      ]
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
      isCircular: false,
      isLeaf: false,
      depth: 3,
      result: [
        'parent.children[1].property',
        'parent.children[1]'
      ]
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
      isCircular: false,
      isLeaf: true,
      depth: 4,
      result: [
        'parent.children[1].property',
        'parent.children[1]'
      ]
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
      isCircular: false,
      isLeaf: true,
      depth: 4,
      result: [
        'parent.children[1].property',
        'parent.children[1]'
      ]
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
      isCircular: false,
      isLeaf: false,
      depth: 3,
      result: [
        'parent.children[1].property',
        'parent.children[1]',
        'parent.children[0].property'
      ]
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
      isCircular: false,
      isLeaf: false,
      depth: 2,
      result: [
        'parent.children[1].property',
        'parent.children[1]',
        'parent.children[0].property',
        'parent.children[0]'
      ]
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
      isCircular: false,
      isLeaf: false,
      depth: 1,
      result: [
        'parent.children[1].property',
        'parent.children[1]',
        'parent.children[0].property',
        'parent.children[0]',
        'parent.children'
      ]
    }
  ],
  warning: null,
  result: [
    'parent.children[1].property',
    'parent.children[1]',
    'parent.children[0].property',
    'parent.children[0]',
    'parent.children',
    'parent'
  ]
};
